import {Vector} from "excalibur";
import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";

export class ElevationLayer implements CoordinateDataLayerInterface<number> {
    private readonly octaveOffsets:Vector[];

    constructor(
        private readonly noiseLayer: CoordinateDataLayerInterface<number>,
        // Higher means more zoomed in, showing details better
        private readonly scale: number = 200, // Current default, because it looks nice
        // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
        private readonly lacunarity: number = 0.5, //Default 0.5
        // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
        private readonly persistence: number = 2, //Default 2
        private readonly octaves: number = 4, //Default 4?
    ) {
        this.octaveOffsets = [];
        for (let i = 0; i <= octaves; i++) {
            const directionModifier = Math.pow(-1,i);
            this.octaveOffsets.push(new Vector(Math.pow(17, i*2) * directionModifier,Math.pow(i*octaves, 10) * -directionModifier));
        }
    }

    getData(coordinate: Vector): number {
        return this.withOctaves(coordinate, this.octaves);
    }

    private withOctaves(coordinate: Vector, amount: number): number {
        let result = 0;
        let sumAmplitudes = 0;
        for (let i = 0; i < amount; i++) {
            const amplitude = Math.pow(this.persistence, i);
            sumAmplitudes += amplitude;
            const multiplier = Math.pow(this.lacunarity, i);
            result += amplitude * this.noiseLayer.getData(coordinate.scale(multiplier/this.scale).add(this.octaveOffsets[i]));
        }

        return result / sumAmplitudes;
    }
}