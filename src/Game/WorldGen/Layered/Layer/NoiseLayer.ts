import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";
import Randomizer from "../../Randomizer.ts";
import {createNoise2D, NoiseFunction2D} from "simplex-noise";
import {Vector} from "excalibur";

export class NoiseLayer implements CoordinateDataLayerInterface<number> {
    private readonly noise: NoiseFunction2D;

    constructor(
        seed: number,
        private readonly waveLength: number = 1,
    ) {
        const          random = new Randomizer(seed);
        this.noise = createNoise2D(() => random.getFloat());
    }

    getData(coordinate: Vector): number {
        return (this.noise(coordinate.x / this.waveLength, coordinate.y / this.waveLength) + 1) * 0.5;
    }
}