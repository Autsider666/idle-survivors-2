import {BoundingBox, Vector} from "excalibur";

export class Pattern {
    public readonly bounds: BoundingBox;

    constructor(
        public readonly points: Vector[],
        private readonly outerBounds:Vector[] = [],
        public readonly velocity?:Vector
    ) {
        this.bounds = BoundingBox.fromPoints(points.concat(outerBounds));
    }

    rotate(angle:number):Pattern {
        return new Pattern(
            this.points.map(point=>point.rotate(angle,this.bounds.center)),
            this.outerBounds.map(point=>point.rotate(angle,this.bounds.center)),
            this.velocity?.rotate(angle,this.bounds.center),
        );
    }
}