import {BoundingBox, Vector} from "excalibur";

export abstract class Shape {
    protected constructor(
        public readonly center: Vector,
        public readonly edgeDistance: number,
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

    abstract contains(value: Shape | BoundingBox | Vector): boolean;

    overlaps(value: Shape | BoundingBox):boolean {
        return this.contains(value);
    }
}