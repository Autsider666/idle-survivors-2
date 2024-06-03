import {Vector, BoundingBox} from "excalibur";
import {Shape} from "./Shape.ts";
import {Circle} from "./Circle.ts";
import {Collision} from "./Collision.ts";

export class Polygon extends Shape {
    constructor(center: Vector, public readonly vertices: Vector[]) {
        let maxDistance = 0;
        vertices.forEach(vertex => {
            maxDistance = Math.max(maxDistance, vertex.distance(center));
        });

        super(center, maxDistance);
    }

    contains(value: Shape | Vector | BoundingBox): boolean {
        if (value instanceof Vector) {
            return Collision.checkPointInPolygon(value, this);
        }

        if (value instanceof Circle) {
            return Collision.checkCircleInPolygon(value, this, true);
        }

        return false;
    }

}