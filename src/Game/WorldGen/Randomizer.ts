import {Random} from "excalibur";

type Point = {
    x: number,
    y: number,
}

export default class Randomizer {
    private readonly random: Random;

    constructor(
        public readonly seed: number,
        public readonly jitter: number = 0.5,
    ) {

        this.random = new Random(this.seed);
    }

    public getFloat({min = 0, max = 1}: { min?: number, max?: number } = {}): number {
        return this.random.floating(min, max);
    }

    public getInt(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
        return this.random.integer(min, max);
    }

    public randomizePoint<P extends Point = Point>(point: P): P {
        return {
            ...point,
            x: this.randomizeValue(point.x),
            y: this.randomizeValue(point.y),
        };
    }

    public randomizeValue(value: number): number {
        return value + this.getJitter();
    }

    public getJitter(): number {
        return this.jitter * (this.getFloat() - this.getFloat());
    }
}