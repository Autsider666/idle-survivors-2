import {Vector} from "excalibur";
import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";

export class ElevationLayer implements CoordinateDataLayerInterface<number> {

    constructor(
        private readonly noiseLayer: CoordinateDataLayerInterface<number>,
    ) {
    }

    getData(coordinate: Vector): number {
        return this.withOctaves(coordinate, 1);
    }

    private withOctaves(coordinate: Vector, amount: number): number {
        let result = 0;
        let sumAmplitudes = 0;
        for (let i = 0; i < amount; i++) {
            const amplitude = Math.pow(0.5, i);
            sumAmplitudes += amplitude;
            const multiplier = Math.pow(2, i);
            result += amplitude * this.noiseLayer.getData(coordinate.scale(multiplier));
        }

        return result / sumAmplitudes;
    }

}