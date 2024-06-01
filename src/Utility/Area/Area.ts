import {BoundingBox, Vector} from "excalibur";

export abstract class Area {
    protected constructor(
        public readonly center: Vector,
        private readonly edgeDistance: number,
    ) {
    }

    get right(): number {
        return this.center.x + this.edgeDistance;
    }

    get left(): number {
        return this.center.x - this.edgeDistance;
    }

    get top(): number {
        return this.center.y - this.edgeDistance;
    }

    get bottom(): number {
        return this.center.y + this.edgeDistance;
    }

    abstract contains(value: Area | BoundingBox | Vector): boolean;
}