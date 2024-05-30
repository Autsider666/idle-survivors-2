import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";
import Randomizer from "../../Randomizer.ts";

export class ElevationLayer implements CoordinateDataLayerInterface<number> {
    private readonly random: Randomizer;

    constructor(
        seed: number,
    ) {
        this.random = new Randomizer(seed);
        const test = new
    }

    getData(/* coordinate: Vector */): number {

        return this.random.getFloat();
    }
}