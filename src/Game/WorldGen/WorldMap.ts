import { Actor, Canvas, CollisionType, Engine, Vector } from "excalibur";
import Delaunator from 'delaunator';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import Randomizer from "./Randomizer";
import PoissonDiskSampling from "poisson-disk-sampling";
import { MapRegion } from "../../Actor/MapRegion";

type MapData = {
    delaunay: Delaunator<Vector>, //TODO refactor asap
    points: Vector[],
    numberOfRegions: number,
    numberOfTriangles: number,
    numberOfEdges: number,
    halfEdges: any,
    triangles: any,
    centers: Vector[],
    elevation: number[],
    moisture: number[],
}

const urlParams = new URLSearchParams(window.location.search);

export class WorldMap extends Actor {
    private readonly seed: number = Number.parseInt(urlParams.get('game') ?? Date.now().toString());
    private readonly waveLength: number = 0.5;
    private readonly random: Randomizer;
    private readonly noise: NoiseFunction2D;

    private readonly mapData: MapData;

    private readonly canvas: Canvas;

    constructor(
        private readonly canvasHeight: number = 3000,
        private readonly canvasWidth: number = 4000,
    ) {
        super({
            height: canvasHeight,
            width: canvasWidth,
            x: 0,
            y: 0,
            z:-10,
            // x: -(canvasWidth / 2),
            // y: -(canvasHeight / 2),
            collisionType: CollisionType.PreventCollision
        });

        this.random = new Randomizer(this.seed);
        this.noise = createNoise2D(() => this.random.getFloat());

        this.mapData = this.generateMapData();

        this.canvas = this.generateCanvas();

        this.graphics.use(this.canvas);
        this.graphics.anchor = Vector.Zero;

    }

    onInitialize(engine: Engine): void {
        this.createActors(engine);
    }

    private createActors(engine: Engine): void {
        const { delaunay, triangles, numberOfEdges, centers, elevation, moisture } = this.mapData;

        const visitedRegions = new Set<number>();
        for (let edgeId = 0; edgeId < numberOfEdges; edgeId++) {
            const regionId = triangles[this.nextHalfedge(edgeId)];
            if (!visitedRegions.has(regionId)) {
                visitedRegions.add(regionId);
                const vertices = this.edgesAroundPoint(delaunay, edgeId)
                    .map(e => centers[this.triangleOfEdge(e)]);

                if (vertices.length < 4) {
                    continue;
                }

                const min = new Vector(Infinity, Infinity);
                const max = new Vector(-Infinity, -Infinity);
                vertices.forEach(vertice => {
                    min.x = Math.min(min.x, vertice.x);
                    min.y = Math.min(min.y, vertice.y);
                    max.x = Math.max(max.x, vertice.x);
                    max.y = Math.max(max.y, vertice.y);
                });

                const anchorVector = max.add(min).scale(0.5);

                const cellActor = new MapRegion({
                    pos: anchorVector,
                    elevation: elevation[regionId],
                    moisture: moisture[regionId],
                    vertices,
                });

                // this.addChild(cellActor);
                engine.add(cellActor);
            }
        }
    }

    private generateMapData(): MapData {
        const points = this.generatePoints();
        const delaunay = Delaunator.from(points, (point: Vector) => point.x, (point: Vector) => point.y);

        return {
            delaunay,
            points,
            numberOfRegions: points.length,
            numberOfTriangles: delaunay.halfedges.length / 3,
            numberOfEdges: delaunay.halfedges.length,
            halfEdges: delaunay.halfedges,
            triangles: delaunay.triangles,
            centers: this.calculateCentroids(points, delaunay),
            elevation: this.generateElevationMap(points),
            moisture: this.generateMoistureMap(points),
        };
    }

    private generatePoints(): Vector[] {
        const points = [];
        const sampler = new PoissonDiskSampling({
            shape: [this.canvasWidth, this.canvasHeight],
            minDistance: 100,
            maxDistance: 250,
            tries: 10,
        }, () => this.random.getFloat());
        for (const [x, y] of sampler.fill()) {
            points.push(new Vector(x, y));
        }

        // points.push({ ...defaultRegion, x: -10, y: this.mapHeight / 2 });
        // points.push({ ...defaultRegion, x: this.mapWidth + 10, y: this.mapHeight / 2 });
        // points.push({ ...defaultRegion, y: -10, x: this.mapWidth / 2 });
        // points.push({ ...defaultRegion, y: this.mapHeight + 10, x: this.mapWidth / 2 });
        // points.push({ ...defaultRegion, x: -10, y: -10 });
        // points.push({ ...defaultRegion, x: this.mapWidth + 10, y: this.mapHeight + 10 });
        // points.push({ ...defaultRegion, y: -10, x: this.mapHeight + 10 });
        // points.push({ ...defaultRegion, y: this.mapHeight + 10, x: -10 });

        return points;
    }

    private generateCanvas(): Canvas {
        return new Canvas({
            width: this.canvasWidth,
            height: this.canvasHeight,
            cache: true,
            draw: (ctx: CanvasRenderingContext2D) => {
                // this.drawCellCenters(ctx);
                this.drawCellColors(
                    ctx,
                    // r => this.mapData.elevation[r] < 0.5 ? "hsl(240, 30%, 50%)" : "hsl(90, 20%, 50%)",
                    this.biomeColorFunction.bind(this),
                );
                this.drawCellBoundaries(ctx);
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
            moisture = moisture * (1 - elevation);
            elevation = elevation ** 4; // tweaks
            red = 210 - 100 * moisture;
            green = 185 - 45 * moisture;
            blue = 139 - 45 * moisture;
            red = 255 * elevation + red * (1 - elevation);
            green = 255 * elevation + green * (1 - elevation);
            blue = 255 * elevation + blue * (1 - elevation);
        }
        return `rgb(${Math.max(0, red) | 0}, ${Math.max(0, green) | 0}, ${Math.max(0, blue) | 0})`;
    }

    private triangleOfEdge(e: number): number {
        return Math.floor(e / 3);
    }
    private nextHalfedge(e: number): number {
        return (e % 3 === 2) ? e - 2 : e + 1;
    }

    private drawCellBoundaries(ctx: CanvasRenderingContext2D) {
        const { delaunay, centers, halfEdges, numberOfEdges } = this.mapData;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        for (let e = 0; e < numberOfEdges; e++) {
            if (e < delaunay.halfedges[e]) {
                const start = centers[this.triangleOfEdge(e)];
                const end = centers[this.triangleOfEdge(halfEdges[e])];
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();

                // this.scene?.engine.add(new Actor({ x: start.x, y: start.y, radius: 2, color: Color.Red }));
                // this.scene?.engine.add(new Actor({ x: end.x, y: end.y, radius: 2, color: Color.Red }));
            }
        }
        ctx.restore();
    }

    // private drawCellCenters(ctx: CanvasRenderingContext2D): void {
    //     ctx.save();
    //     ctx.fillStyle = "hsl(0, 50%, 50%)";
    //     for (let { x, y } of this.mapData.points) {
    //         ctx.beginPath();
    //         ctx.arc(x, y, 1, 0, 2 * Math.PI);
    //         ctx.fill();
    //     }
    //     ctx.restore();
    // }

    private calculateCentroids(points: Vector[], delaunay: Delaunator<Vector>): Vector[] {
        const numberOfTriangles = delaunay.halfedges.length / 3;
        const centroids = [];
        for (let t = 0; t < numberOfTriangles; t++) {
            let sumOfX = 0, sumOfY = 0;
            for (let i = 0; i < 3; i++) {
                let s = 3 * t + i;
                let p = points[delaunay.triangles[s]];
                sumOfX += p.x;
                sumOfY += p.y;
            }
            centroids[t] = new Vector(sumOfX / 3, sumOfY / 3);
        }
        return centroids;
    }

    private generateElevationMap(points: Vector[]): number[] {
        const elevationMap = [];
        for (let r = 0; r < points.length; r++) {
            const nx = points[r].x / this.canvasWidth - 1 / 2;
            const ny = points[r].y / this.canvasHeight - 1 / 2;
            // start with noise:
            elevationMap[r] = (1 + this.noise(nx / this.waveLength, ny / this.waveLength)) / 2;
            // modify noise to make islands:
            const d = 2 * Math.max(Math.abs(nx), Math.abs(ny)); // should be 0-1
            elevationMap[r] = (1 + elevationMap[r] - d) / 2;
        }

        return elevationMap;
    }

    private generateMoistureMap(points: Vector[]): number[] {
        const moistureMap = [];
        for (let r = 0; r < points.length; r++) {
            const nx = points[r].x / this.canvasWidth - 1 / 2;
            const ny = points[r].y / this.canvasHeight - 1 / 2;
            // start with noise:
            moistureMap[r] = (1 + this.noise(nx / this.waveLength, ny / this.waveLength)) / 2;
        }

        return moistureMap;
    }

    private edgesAroundPoint(delaunay: Delaunator<Vector>, start: number): number[] {
        const result = [];
        let incoming = start;
        do {
            result.push(incoming);
            const outgoing = this.nextHalfedge(incoming);
            incoming = delaunay.halfedges[outgoing];
        } while (incoming !== -1 && incoming !== start);
        return result;
    }

    private drawCellColors(ctx: CanvasRenderingContext2D, colorFn: (r: number) => string) {
        ctx.save();
        const seen = new Set<number>();
        const { delaunay, triangles, numberOfEdges, centers } = this.mapData;
        for (let e = 0; e < numberOfEdges; e++) {
            const r = triangles[this.nextHalfedge(e)];
            if (!seen.has(r)) {
                seen.add(r);
                const vertices = this.edgesAroundPoint(delaunay, e)
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