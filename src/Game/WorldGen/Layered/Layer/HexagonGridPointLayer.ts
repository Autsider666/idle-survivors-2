import {Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {LayerFunction} from "../../../../Utility/LayerFunction.ts";
import {Shape} from "../../../../Utility/Geometry/Shape.ts";
import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {Polygon} from "../../../../Utility/Geometry/Polygon.ts";

const TAU = 2 * Math.PI;

const isEven = (value: number) => (value % 2) === 0;

export class HexagonGridPointLayer extends AbstractFilteredDataLayer<Polygon> {
    private readonly cache = new Array2D<Polygon[]>();

    private readonly width: number;
    private readonly height: number;
    private readonly size: number;
    private readonly distanceX: number;
    private readonly distanceY: number;
    private readonly amountX: number;
    private readonly amountY: number;

    constructor(
        private readonly gridSize: number,
        private readonly tileSize: number,
        private readonly flatTop: boolean,
    ) {
        super();

        if (flatTop) {
            this.width = tileSize;
            this.size = this.width / 2;
            this.height = Math.sqrt(3) * this.size;
            this.distanceX = 0.75 * this.width;
            this.distanceY = this.height;
            this.amountX = Math.floor(this.gridSize / this.distanceX);
            this.amountY = Math.floor(this.gridSize / this.distanceY);
        } else {
            this.height = this.tileSize;
            this.size = this.height / 2;
            this.width = Math.sqrt(3) * this.size;
            this.distanceX = this.width;
            this.distanceY = 0.75 * this.height;
            this.amountX = Math.floor(this.gridSize / this.distanceX);
            this.amountY = Math.floor(this.gridSize / this.distanceY);
        }
    }

    public getData(area: Shape): Set<Polygon> {
        const data = new Set<Polygon>();

        LayerFunction.iterateGridByArea(area, this.amountX*this.distanceX, this.amountY*this.distanceY, (gridX: number, gridY: number): void => {
            const polygons = this.cache.get(gridX, gridY) ?? this.generateGridArea(gridX, gridY);
            polygons.forEach(polygon => {
                if (area.contains(polygon)) {
                    data.add(polygon);
                }
            });
        });

        return data;
    }


    private generateGridArea(x: number, y: number): Polygon[] {
        const topLeft = new Vector(x * this.amountX*this.distanceX, y * this.amountY*this.distanceY);

        const polygons:Polygon[] = [];
        for (let dX = 0; dX < this.amountX; dX++) {
            let yMod = 0;
            if (this.flatTop && isEven(dX)) {
                yMod += 0.5;
            }

            for (let dY = 0; dY < this.amountY; dY++) {
                let xMod = 0;
                if (!this.flatTop && isEven(dY)) {
                    xMod += 0.5;
                }

                const center = topLeft.add(new Vector((dX+xMod)*this.distanceX,(dY+yMod)*this.distanceY));

                polygons.push(new Polygon(
                    center,
                    this.generateHexagon(center, this.size),
                ));
            }
        }

        this.cache.set(x, y, polygons);

        return polygons;
    }

    private generateHexagon(center: Vector, radius: number): Vector[] {
        const edges: Vector[] = [];
        const start = this.flatTop ? 0 : TAU/12;

        for (let a = start; a < TAU + start; a += TAU / 6) {
            edges.push(new Vector(
                center.x + radius * Math.cos(a),
                center.y + radius * Math.sin(a)
            ));
        }

        return edges;
    }
}