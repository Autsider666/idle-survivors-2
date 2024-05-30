import {AreaDataLayerInterface} from "./AreaDataLayerInterface.ts";
import {BoundingBox, Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {MapGenFunction} from "../../MapGenFunction.ts";
import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {LayerFunction} from "../../../../Utility/LayerFunction.ts";

export type PolygonData = Readonly<{
    pos: Vector,
    vertices: Vector[]
}>

export class PolygonLayer extends AbstractFilteredDataLayer<PolygonData> {
    private readonly data: Array2D<PolygonData[]> = new Array2D<PolygonData[]>();

    constructor(
        private readonly gridWidth: number,
        private readonly gridHeight: number,
        private readonly pointLayer: AreaDataLayerInterface<Vector>,
    ) {
        super();
    }

    // public getFilteredData(area:BoundingBox,exclude:Set<PolygonData>):Set<PolygonData> {
    //     const data = this.getData(area);
    //     const result = new Set<PolygonData>();
    //     for (const polygon of data) {
    //         if (exclude.has(polygon)) {
    //             continue;
    //         }
    //
    //         result.add(polygon)
    //     }
    //
    //     return result;
    // }

    public getData(area: BoundingBox): Set<PolygonData> {
        const data = new Set<PolygonData>();

        LayerFunction.iterateGridByArea(area, this.gridWidth, this.gridHeight, (gridX: number, gridY: number): void => {
            const polygons = this.retrieveData(gridX, gridY);
            for (const polygon of polygons) {
                if (area.contains(polygon.pos)) {
                    data.add(polygon);
                }
            }
        });

        return data;
    }

    private retrieveData(x: number, y: number): PolygonData[] {
        if (!this.data.has(x, y)) {
            this.generateGridArea(x, y);
        }

        const data = this.data.get(x, y);
        if (data === undefined) {
            throw new Error('This should never happen right?');
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
                globalOffset.sub(new Vector(this.gridWidth, this.gridHeight))
            )
        );

        const polygons: PolygonData[] = [];
        for (const vertices of MapGenFunction.calculateVertices(Array.from(points))) {
            if (vertices.length < 3) {
                continue;
            }

            const pos = MapGenFunction.calculateAnchor(vertices);
            if (!this.isPointInGrid(pos, x, y)) {
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