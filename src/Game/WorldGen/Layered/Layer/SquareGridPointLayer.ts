import {Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {LayerFunction} from "../../../../Utility/LayerFunction.ts";
import {Shape} from "../../../../Utility/Geometry/Shape.ts";
import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {Polygon} from "../../../../Utility/Geometry/Polygon.ts";
import {Rectangle} from "../../../../Utility/Geometry/Rectangle.ts";

export class SquareGridPointLayer extends AbstractFilteredDataLayer<Polygon> {
    private readonly cache: Array2D<Polygon[]> = new Array2D<Polygon[]>();

    constructor(
        private readonly tileSize: number,
    ) {
        super();
    }

    public getData(area: Shape): Set<Polygon> {
        const data = new Set<Polygon>();
        LayerFunction.iterateGridByArea(area, this.tileSize, this.tileSize, (gridX: number, gridY: number): void => {
            const polygons = this.cache.get(gridX, gridY) ?? this.generateGridArea(gridX, gridY);
            for (const polygon of polygons) {
                if (area.contains(polygon.center)) {// TODO replace with whole polygon
                    data.add(polygon);
                }
            }
        });

        return data;
    }


    private generateGridArea(x: number, y: number): Polygon[] {
        const globalOffset = new Vector((x+0.5) * this.tileSize, (y+0.5) * this.tileSize);

        const tile = new Rectangle(
            globalOffset,
            this.tileSize,
            this.tileSize,
        );

        this.cache.set(x, y, [tile]);

        return [tile];
    }
}