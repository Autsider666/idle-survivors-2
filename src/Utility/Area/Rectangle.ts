import {Vector} from "excalibur";
import {Polygon} from "./Polygon.ts";

export class Rectangle extends Polygon {

    constructor(
        center: Vector,
        public readonly width: number,
        public readonly height: number,
        // public readonly anchor: Vector = Vector.Half, //TODO when math works again
    ) {
        const topLeft = center.sub(new Vector(width/2, height/2));
        super(
            center,
            [
            topLeft,
            topLeft.add(new Vector(width,0)),
            topLeft.add(new Vector(width,height)),
            topLeft.add(new Vector(0,height))
        ]
        );
    }
}