import {Vector} from "excalibur";
import {Polygon} from "./Polygon.ts";
import {Circle} from "./Circle.ts";

type Line = [point1: Vector, point2: Vector];

export class Collision {
    // https://www.jeffreythompson.org/collision-detection/poly-point.php
    static checkPointInPolygon(point: Vector, polygon: Polygon): boolean {
        const vertices = polygon.vertices;

        let collision = false;
        let next = 0;
        for (let current = 0; current < vertices.length; current++) {
            next = current + 1;
            if (next === vertices.length) {
                next = 0;
            }

            const vertexCurrent = vertices[current];
            const vertexNext = vertices[next];

            if (((vertexCurrent.y > point.y) !== (vertexNext.y > point.y))
                && (point.x < (vertexNext.x - vertexCurrent.x) * (point.y - vertexCurrent.y) / (vertexNext.y - vertexCurrent.y) + vertexCurrent.x)) {
                collision = !collision;
            }
        }

        return collision;
    }

    static checkCircleInPolygon(circle: Circle, polygon: Polygon, checkInside:boolean = false): boolean {
        const vertices = polygon.vertices;
        let next = 0;
        for (let current = 0; current < vertices.length; current++) {
            next = current + 1;
            if (next === vertices.length) {
                next = 0;
            }

            const vertexCurrent = vertices[current];
            const vertexNext = vertices[next];

            if (this.checkLineInCircle([vertexCurrent, vertexNext], circle)) {
                return true;
            }
        }

        // Check if inside
        if (checkInside && this.checkPointInPolygon(circle.center,polygon)) {
            return true;
        }

        return false;
    }

    // https://www.jeffreythompson.org/collision-detection/line-circle.php
    static checkLineInCircle(line: Line, circle: Circle): boolean {
        if (line.length !== 2) {
            throw new Error('Invalid line'); //TODO add Line Area?
        }

        const point1 = line[0];
        const point2 = line[1];

        if (this.checkPointInCircle(point1, circle) || this.checkPointInCircle(point2, circle)) {
            return true;
        }

        const lineLength = this.lineLength(line);
        const dotProduct = (
            ((circle.center.x - point1.x) * (point2.x - point1.x))
            + ((circle.center.y - point1.y) * (point2.y - point1.y))
        ) / Math.pow(lineLength, 2);

        const closestPoint = new Vector(
            point1.x + (dotProduct * (point2.x - point1.x)),
            point1.y + (dotProduct * (point2.y - point1.y)),
        );

        if (!this.checkPointInLine(closestPoint, line)) {
            return false;
        }

        return this.checkPointInCircle(closestPoint, circle);
    }

    // https://www.jeffreythompson.org/collision-detection/point-circle.php
    static checkPointInCircle(point: Vector, circle: Circle): boolean {
        return point.distance(circle.center) <= circle.radius;
    }

    // https://www.jeffreythompson.org/collision-detection/line-point.php
    // Higher accuracy value === less accurate
    static checkPointInLine(point: Vector, line: Line, accuracy: number = 0.1): boolean {
        const lineLength = this.lineLength(line);

        const point1 = line[0];
        const point2 = line[1];

        const distance1 = point1.distance(point);
        const distance2 = point2.distance(point);

        return distance1 + distance2 >= lineLength - accuracy && distance1 + distance2 <= lineLength + accuracy;
    }

    static lineLength(line: Line): number {
        return line[0].distance(line[1]);
    }
}