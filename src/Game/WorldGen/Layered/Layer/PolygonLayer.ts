import {AreaDataLayerInterface} from "./AreaDataLayerInterface.ts";
import {Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {MapGenFunction} from "../../MapGenFunction.ts";
import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {LayerFunction} from "../../../../Utility/LayerFunction.ts";
import {Shape} from "../../../../Utility/Geometry/Shape.ts";
import {Polygon} from "../../../../Utility/Geometry/Polygon.ts";
import {Rectangle} from "../../../../Utility/Geometry/Rectangle.ts";

export class PolygonLayer extends AbstractFilteredDataLayer<Polygon> {
    private readonly cache: Array2D<Polygon[]> = new Array2D<Polygon[]>();

    constructor(
        private readonly gridWidth: number,
        private readonly gridHeight: number,
        private readonly pointLayer: AreaDataLayerInterface<Vector>,
    ) {
        super();
    }

    public getData(area: Shape): Set<Polygon> {
        const data = new Set<Polygon>();
        LayerFunction.iterateGridByArea(area, this.gridWidth, this.gridHeight, (gridX: number, gridY: number): void => {
            const polygons = this.cache.get(gridX, gridY) ?? this.generateGridArea(gridX, gridY);
            for (const polygon of polygons) {
                if (area.contains(polygon)) {
                    data.add(polygon);
                }
            }
        });

        return data;
    }


    private generateGridArea(x: number, y: number): Polygon[] {
        const globalOffset = new Vector(x * this.gridWidth, y * this.gridHeight);

        const points = this.pointLayer.getData(
            new Rectangle(
                globalOffset,
                this.gridWidth * 3,
                this.gridHeight * 3,
            ),
        );

        const polygons: Polygon[] = [];
        for (const vertices of MapGenFunction.calculateVertices(Array.from(points))) {
            if (vertices.length < 3) {
                continue;
            }

            const center = MapGenFunction.calculateAnchor(vertices);
            if (!this.isPointInGrid(center, x, y)) {
                continue;
            }

            polygons.push(new Polygon(center,vertices));
        }

        this.cache.set(x, y, polygons);

        return polygons;
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