import {Shape} from "./Shape.ts";
import {BoundingBox, Vector} from "excalibur";
import {Polygon} from "./Polygon.ts";
import {Collision} from "./Collision.ts";

export class Circle extends Shape {
    constructor(center:Vector, public readonly radius:number) {
        super(center, radius);
    }

    contains(value: Shape|BoundingBox|Vector): boolean {
        if (value instanceof Circle) {
            return this.center.distance(value.center) <= this.radius + value.radius;
        }

        if (value instanceof BoundingBox) {
            const polygon = new Polygon(value.center,value.getPoints());

            return Collision.checkCircleInPolygon(this,polygon,true);

            // let targetX = this.center.x;
            // if (targetX < value.center.x) {
            //     targetX = value.center.x;
            // } else if (targetX > value.center.x + value.width) {
            //     targetX = value.center.x + value.width;
            // }
            //
            // targetX = this.center.x - targetX;
            //
            // let targetY = this.center.y;
            // if (targetY < value.center.y) {
            //     targetY = value.center.y;
            // } else if (targetY > value.center.y + value.height) {
            //     targetY = value.center.y + value.height;
            // }
            //
            // targetY = this.center.y - targetY;
            //
            // const distance = Math.sqrt((Math.pow(targetX, 2) + Math.pow(targetY, 2)));
            //
            // return distance <= this.radius;
        }

        if (value instanceof Vector) {
            return this.center.distance(value) <= this.radius;
        }

        if (value instanceof Polygon) {
            return Collision.checkCircleInPolygon(this,value,true);
        }

        throw new Error('Warning: Circle does not have code for: '+value.constructor.name);
    }

}