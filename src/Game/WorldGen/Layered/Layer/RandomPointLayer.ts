import {DataLayerInterface} from "./DataLayerInterface.ts";
import {BoundingBox, Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {MapGenFunction} from "../../MapGenFunction.ts";
import Randomizer from "../../Randomizer.ts";
import {CoordinateBasedSeedGenerator} from "../../../../Utility/CoordinateBasedSeedGenerator.ts";

export class RandomPointLayer implements DataLayerInterface<Vector> {
    private readonly data: Array2D<Vector[]> = new Array2D<Vector[]>();
    private readonly generator: CoordinateBasedSeedGenerator;

    constructor(
        seed: number,
        private readonly gridWidth: number,
        private readonly gridHeight: number,
        private readonly pointsPerGrid: number,
    ) {
        this.generator = new CoordinateBasedSeedGenerator(seed);
    }

    public getData(area: BoundingBox): Set<Vector> {
        const data= new Set<Vector>;

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
                const randomPoints = this.retrieveData(gridX, gridY);
                for (const point of randomPoints) {
                    if (area.contains(point)) {
                        data.add(point);
                    }
                }
            }
        }

        return data;
    }

    private retrieveData(x: number, y: number): Vector[] {
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

        const randomizer = new Randomizer(this.generator.getSeed(x, y));
        const points: Vector[] = MapGenFunction.generatePointsByRegion(
            this.gridWidth,
            this.gridHeight,
            this.pointsPerGrid,
            (min: number, max: number) => randomizer.getInt(min, max),
        );

        this.data.set(x, y, points.map(point => point.add(globalOffset)));
    }
}