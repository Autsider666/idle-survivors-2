import { Actor, Canvas, Vector } from "excalibur";
import Delaunator from 'delaunator';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import Randomizer from "./Randomizer";

type Point = {
    x: number,
    y: number,
}

type Region = Point & {
    elevation: number,
    moisture: number
}

type MapData = {
    delaunay: Delaunator<Region>, //TODO refactor asap
    points: Region[],
    numRegions: number,
    numTriangles: number,
    numEdges: number,
    halfedges: any,
    triangles: any,
    centers: Point[],
    elevation: number[],
    moisture: number[],
}

type ColorFunction = (r: number) => string;

const urlParams = new URLSearchParams(window.location.search);

export class WorldMap extends Actor {
    private readonly seed: number = Number.parseInt(urlParams.get('game') ?? Date.now().toString());
    private readonly waveLength: number = 0.5;
    private readonly random: Randomizer;
    private readonly noise: NoiseFunction2D;

    private readonly mapHeight: number = 50;
    private readonly mapWidth: number = 50;

    private readonly mapData: MapData;

    private readonly canvas: Canvas;

    constructor(
        private readonly canvasHeight: number = 2000,
        private readonly canvasWidth: number = 2000,
    ) {
        super({
            height: canvasHeight,
            width: canvasWidth,
            x: -(canvasWidth / 2),
            y: -(canvasHeight / 2),
        });

        this.random = new Randomizer(this.seed);
        this.noise = createNoise2D(() => this.random.getFloat());

        this.mapData = this.generateMapData();

        this.canvas = this.generateCanvas();

        this.graphics.use(this.canvas);
        this.graphics.anchor = Vector.Zero;

    }

    private generateMapData(): MapData {
        const points = this.generatePoints();
        const delaunay = Delaunator.from(points, (point: Region) => point.x, (point: Region) => point.y);

        return {
            delaunay,
            points,
            numRegions: points.length,
            numTriangles: delaunay.halfedges.length / 3,
            numEdges: delaunay.halfedges.length,
            halfedges: delaunay.halfedges,
            triangles: delaunay.triangles,
            centers: this.calculateCentroids(points, delaunay),
            elevation: this.generateElevationMap(points),
            moisture: this.generateMoistureMap(points),
        };
    }

    private generatePoints(): Region[] {
        const points = [];
        const defaultRegion: Region = { x: 0, y: 0, elevation: 0, moisture: 0 };
        for (let x = 0; x < this.mapWidth; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                points.push(this.random.randomizePoint({ ...defaultRegion, x, y }));
            }
        }

        points.push({ ...defaultRegion, x: -10, y: this.mapHeight / 2 });
        points.push({ ...defaultRegion, x: this.mapWidth + 10, y: this.mapHeight / 2 });
        points.push({ ...defaultRegion, y: -10, x: this.mapWidth / 2 });
        points.push({ ...defaultRegion, y: this.mapHeight + 10, x: this.mapWidth / 2 });
        points.push({ ...defaultRegion, x: -10, y: -10 });
        points.push({ ...defaultRegion, x: this.mapWidth + 10, y: this.mapHeight + 10 });
        points.push({ ...defaultRegion, y: -10, x: this.mapHeight + 10 });
        points.push({ ...defaultRegion, y: this.mapHeight + 10, x: -10 });

        return points;
    }

    private generateCanvas(): Canvas {
        return new Canvas({
            width: this.canvasWidth,
            height: this.canvasHeight,
            cache: true,
            draw: (ctx: CanvasRenderingContext2D) => {
                // this.drawCellCenters(ctx);
                // this.drawCellBoundaries(ctx);
                this.drawCellColors(
                    ctx,
                    this.biomeColorFunction.bind(this),
                );
            }
        });
    }

    private biomeColorFunction(r: number): string {
        let elevation = (this.mapData.elevation[r] - 0.5) * 2;
        let moisture = this.mapData.moisture[r];
        let red: number;
        let green: number;
        let blue: number;
        if (elevation < 0.0) {
            red = 48 + 48 * elevation;
            green = 64 + 64 * elevation;
            blue = 127 + 127 * elevation;
        } else {
            moisture = moisture * (1 - elevation); elevation = elevation ** 4; // tweaks
            red = 210 - 100 * moisture;
            green = 185 - 45 * moisture;
            blue = 139 - 45 * moisture;
            red = 255 * elevation + red * (1 - elevation);
            green = 255 * elevation + green * (1 - elevation);
            blue = 255 * elevation + blue * (1 - elevation);
        }
        return `rgb(${red | 0}, ${green | 0}, ${blue | 0})`;
    }

    private triangleOfEdge(e: number): number {
        return Math.floor(e / 3);
    }
    private nextHalfedge(e: number): number {
        return (e % 3 === 2) ? e - 2 : e + 1;
    }

    // private drawCellBoundaries(ctx: CanvasRenderingContext2D) {
    //     const { delaunay, centers, halfedges, numEdges } = this.mapData;
    //     ctx.save();
    //     ctx.scale(this.canvasWidth / this.mapWidth, this.canvasHeight / this.mapHeight);
    //     ctx.lineWidth = 0.02;
    //     ctx.strokeStyle = "black";
    //     for (let e = 0; e < numEdges; e++) {
    //         if (e < delaunay.halfedges[e]) {
    //             const p = centers[this.triangleOfEdge(e)];
    //             const q = centers[this.triangleOfEdge(halfedges[e])];
    //             ctx.beginPath();
    //             ctx.moveTo(p.x, p.y);
    //             ctx.lineTo(q.x, q.y);
    //             ctx.stroke();
    //         }
    //     }
    //     ctx.restore();
    // }

    // private drawCellCenters(ctx: CanvasRenderingContext2D): void {
    //     ctx.save();
    //     ctx.scale(this.canvasWidth / this.mapWidth, this.canvasHeight / this.mapHeight);
    //     ctx.fillStyle = "hsl(0, 50%, 50%)";
    //     for (let { x, y } of this.mapData.points) {
    //         ctx.beginPath();
    //         ctx.arc(x, y, 0.1, 0, 2 * Math.PI);
    //         ctx.fill();
    //     }
    //     ctx.restore();
    // }

    private calculateCentroids(points: Region[], delaunay: Delaunator<Region>): Point[] {
        const numTriangles = delaunay.halfedges.length / 3;
        let centroids = [];
        for (let t = 0; t < numTriangles; t++) {
            let sumOfX = 0, sumOfY = 0;
            for (let i = 0; i < 3; i++) {
                let s = 3 * t + i;
                let p = points[delaunay.triangles[s]];
                sumOfX += p.x;
                sumOfY += p.y;
            }
            centroids[t] = { x: sumOfX / 3, y: sumOfY / 3 };
        }
        return centroids;
    }

    private generateElevationMap(points: Region[]): number[] {
        const elevationMap = [];
        for (let r = 0; r < points.length; r++) {
            const nx = points[r].x / this.mapWidth - 1 / 2;
            const ny = points[r].y / this.mapHeight - 1 / 2;
            // start with noise:
            elevationMap[r] = (1 + this.noise(nx / this.waveLength, ny / this.waveLength)) / 2;
            // modify noise to make islands:
            const d = 2 * Math.max(Math.abs(nx), Math.abs(ny)); // should be 0-1
            elevationMap[r] = (1 + elevationMap[r] - d) / 2;
        }

        return elevationMap;
    }

    private generateMoistureMap(points: Region[]): number[] {
        const moistureMap = [];
        for (let r = 0; r < points.length; r++) {
            const nx = points[r].x / this.mapWidth - 1 / 2;
            const ny = points[r].y / this.mapHeight - 1 / 2;
            // start with noise:
            moistureMap[r] = (1 + this.noise(nx / this.waveLength, ny / this.waveLength)) / 2;


            // // modify noise to make islands:
            // const d = 2 * Math.max(Math.abs(nx), Math.abs(ny)); // should be 0-1
            // moistureMap[r] = (1 + moistureMap[r] - d) / 2;
        }

        return moistureMap;
    }

    private edgesAroundPoint(delaunay: Delaunator<Region>, start: number): number[] {
        const result = [];
        let incoming = start;
        do {
            result.push(incoming);
            const outgoing = this.nextHalfedge(incoming);
            incoming = delaunay.halfedges[outgoing];
        } while (incoming !== -1 && incoming !== start);
        return result;
    }

    private drawCellColors(ctx: CanvasRenderingContext2D, colorFn: ColorFunction) {
        ctx.save();
        ctx.scale(this.canvasWidth / this.mapWidth, this.canvasHeight / this.mapHeight);
        let seen = new Set<number>();
        let { delaunay, triangles, numEdges, centers } = this.mapData;
        for (let e = 0; e < numEdges; e++) {
            const r = triangles[this.nextHalfedge(e)];
            if (!seen.has(r)) {
                seen.add(r);
                let vertices = this.edgesAroundPoint(delaunay, e)
                    .map(e => centers[this.triangleOfEdge(e)]);
                ctx.fillStyle = colorFn(r);
                ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                    ctx.lineTo(vertices[i].x, vertices[i].y);
                }
                ctx.fill();
            }
        }
    }
}