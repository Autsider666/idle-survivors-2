import {AreaDataLayerInterface} from "./AreaDataLayerInterface.ts";
import {Vector} from "excalibur";
import Array2D from "../../../../Utility/Array2D.ts";
import {MapGenFunction} from "../../MapGenFunction.ts";
import Randomizer from "../../Randomizer.ts";
import {CoordinateBasedSeedGenerator} from "../../../../Utility/CoordinateBasedSeedGenerator.ts";
import {LayerFunction} from "../../../../Utility/LayerFunction.ts";
import {Shape} from "../../../../Utility/Geometry/Shape.ts";

export class RandomPointLayer implements AreaDataLayerInterface<Vector> {
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

    public getData(area: Shape): Set<Vector> {
        const data = new Set<Vector>;

        LayerFunction.iterateGridByArea(area, this.gridWidth, this.gridHeight, (gridX: number, gridY: number) => {
            const randomPoints = this.retrieveData(gridX, gridY);
            for (const point of randomPoints) {
                if (area.contains(point)) {
                    data.add(point);
                }
            }
        });

        return data;
    }

    private retrieveData(x: number, y: number): Vector[] {
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