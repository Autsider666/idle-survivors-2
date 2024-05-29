import {createNoise2D, NoiseFunction2D} from "simplex-noise";
import Randomizer from "../Game/WorldGen/Randomizer.ts";

export class CoordinateBasedSeedGenerator {
    private readonly gridSeedNoise: NoiseFunction2D;

    constructor(
        private readonly seed:number,
    ) {
        const gridSeedRandomizer = new Randomizer(this.seed);
        this.gridSeedNoise = createNoise2D(() => gridSeedRandomizer.getFloat());
    }

    getSeed(x: number, y: number): number {
        const zoom = 1;
        const heightScale = 1;
        const rand = (
            ((this.gridSeedNoise(x * zoom, y * zoom) * heightScale) +
                (this.gridSeedNoise(x * zoom / 10, y * zoom / 10) * heightScale)) *
            (this.gridSeedNoise(x * zoom / 5, y * zoom / 5)) +
            (this.gridSeedNoise(x * zoom / 10, y * zoom / 10) * heightScale) +
            (heightScale / 2)
        );

        if (x === 0 && y === 0) {
            return this.seed;
        }

        return Math.floor(Math.abs(rand) * 1000000);
    }
}