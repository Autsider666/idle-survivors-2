import {DataLayer} from "./DataLayer.ts";
import {BoundingBox, Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {MapGenFunction} from "../../MapGenFunction.ts";

export type PolygonData = Readonly<{
    pos: Vector,
    vertices: Vector[]
}>

export class PolygonLayer implements DataLayer<PolygonData[]> {
    private readonly data: Array2D<PolygonData[]> = new Array2D<PolygonData[]>();

    constructor(
        private readonly gridWidth: number,
        private readonly gridHeight: number,
        private readonly pointLayer: DataLayer<Vector[]>,
    ) {
    }

    public getFilteredData(area:BoundingBox,exclude:Set<PolygonData>):Set<PolygonData> {
        const data = this.getData(area);
        const result = new Set<PolygonData>();
        for (const polygon of data) {
            if (exclude.has(polygon)) {
                continue;
            }

            result.add(polygon)
        }

        return result;
    }

    public getData(area: BoundingBox): PolygonData[] {
        const data: PolygonData[] = [];

        let maxX = area.right / this.gridWidth;
        if (Number.isInteger(maxX)) {
            maxX--;
        } else {
            maxX = Math.floor(maxX);
        }

        let maxY = area.bottom / this.gridHeight;
        if (Number.isInteger(maxY)) {
            maxY--;
        } else {
            maxY = Math.floor(maxY);
        }

        for (let gridX = Math.floor(area.left / this.gridWidth); gridX <= maxX; gridX++) {
            for (let gridY = Math.floor(area.top / this.gridHeight); gridY <= maxY; gridY++) {
                const polygons = this.retrieveData(gridX, gridY);
                for (const polygon of polygons) {
                    if (area.contains(polygon.pos)) {
                        data.push(polygon);
                    }
                }
            }
        }

        return data;
    }

    private retrieveData(x: number, y: number): PolygonData[] {
        if (!this.data.has(x, y)) {
            this.generateGridArea(x, y);
        }

        const data = this.data.get(x, y);
        if (data === undefined) {
            throw new Error('This should never happen right?')
        }

        return data;
    }

    private generateGridArea(x: number, y: number): void {
        const globalOffset = new Vector(x * this.gridWidth, y * this.gridHeight);

        const points = this.pointLayer.getData(
            BoundingBox.fromDimension(
                this.gridWidth * 3,
                this.gridHeight * 3,
                Vector.Zero,
                globalOffset.sub(new Vector(this.gridWidth,this.gridHeight))
            )
        );

        const polygons:PolygonData[] = [];
        for (const vertices of MapGenFunction.calculateVertices(points)) {
            if (vertices.length < 3) {
                continue;
            }

            const pos = MapGenFunction.calculateAnchor(vertices);
            if (!this.isPointInGrid(pos,x,y)) {
                continue;
            }

            polygons.push({
                vertices,
                pos,
            });
        }

        this.data.set(x, y, polygons);
    }

    private isPointInGrid(point: Vector, x: number, y: number): boolean {
        const left = x * this.gridWidth;
        const top = y * this.gridHeight;
        return point.x >= left
            && point.y >= top
            && point.x <= left + this.gridWidth
            && point.y <= top + this.gridHeight;
    }
}