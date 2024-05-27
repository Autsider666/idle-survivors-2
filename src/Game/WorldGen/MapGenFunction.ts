import {Vector} from "excalibur";
import Delaunator from "delaunator";

export class MapGenFunction {
    static lerp(a: number, b: number, alpha: number): number {
        return a + alpha * (b - a);
    }

    static squareBump(nx: number, ny: number): number {
        return 1 - (1 - Math.pow(nx, 2)) * (1 - Math.pow(ny, 2));
    }

    static euclideanSquared(nx: number, ny: number): number {
        return Math.min(1, Math.pow(nx, 2) + Math.pow(ny, 2) / Math.sqrt(2));
    }

    static calculateCentroids(points: Vector[], delaunay: Delaunator<Vector>): Vector[] {
        const numberOfTriangles = delaunay.halfedges.length / 3;
        const centroids = [];
        for (let t = 0; t < numberOfTriangles; t++) {
            let sumOfX = 0, sumOfY = 0;
            for (let i = 0; i < 3; i++) {
                const s = 3 * t + i;
                const p = points[delaunay.triangles[s]];
                sumOfX += p.x;
                sumOfY += p.y;
            }
            centroids[t] = new Vector(sumOfX / 3, sumOfY / 3); // TODO does this work?
            // centroids[t] = new Vector(Math.floor(sumOfX / 3),Math.floor( sumOfY / 3));
        }
        return centroids;
    }

    static calculateVertices(points: Vector[], delaunay?: Delaunator<Vector>): Vector[][] {
        delaunay = delaunay ?? Delaunator.from(points, (point: Vector) => point.x, (point: Vector) => point.y);
        const numberOfEdges = delaunay.halfedges.length;
        const triangles = delaunay.triangles;
        const centers = MapGenFunction.calculateCentroids(points, delaunay);
        const verticesGroups: Vector[][] = [];
        const visitedRegions = new Set<number>();
        for (let edgeId = 0; edgeId < numberOfEdges; edgeId++) {
            const regionId = triangles[MapGenFunction.nextHalfEdge(edgeId)];
            if (!visitedRegions.has(regionId)) {
                visitedRegions.add(regionId);
                const vertices: Vector[] = MapGenFunction.edgesAroundPoint(delaunay, edgeId)
                    .map(e => centers[this.triangleOfEdge(e)]);

                verticesGroups.push(vertices);
            }
        }

        return verticesGroups;
    }

    static generateCells(points: Vector[]):{anchor:Vector,vertices:Vector[]}[] {
        const delaunay = Delaunator.from(points, (point: Vector) => point.x, (point: Vector) => point.y);
        const numberOfEdges = delaunay.halfedges.length;
        const triangles = delaunay.triangles;
        const centers = MapGenFunction.calculateCentroids(points, delaunay);
        const cells: {anchor:Vector,vertices:Vector[]}[] = [];
        const visitedRegions = new Set<number>();
        for (let edgeId = 0; edgeId < numberOfEdges; edgeId++) {
            const regionId = triangles[MapGenFunction.nextHalfEdge(edgeId)];
            if (!visitedRegions.has(regionId)) {
                visitedRegions.add(regionId);
                const vertices: Vector[] = MapGenFunction.edgesAroundPoint(delaunay, edgeId)
                    .map(e => centers[this.triangleOfEdge(e)]);

                cells.push({
                    anchor: MapGenFunction.calculateAnchor(vertices),
                    vertices,
                });
            }
        }

        return cells;
    }

    static triangleOfEdge(e: number): number {
        return Math.floor(e / 3);
    }

    static nextHalfEdge(e: number): number {
        return (e % 3 === 2) ? e - 2 : e + 1;
    }

    static edgesAroundPoint(delaunay: Delaunator<Vector>, start: number): number[] {
        const result = [];
        let incoming = start;
        do {
            result.push(incoming);
            const outgoing = MapGenFunction.nextHalfEdge(incoming);
            incoming = delaunay.halfedges[outgoing];
        } while (incoming !== -1 && incoming !== start);
        return result;
    }

    static calculateAnchor(vertices: Vector[]): Vector {
        const min = new Vector(Infinity, Infinity);
        const max = new Vector(-Infinity, -Infinity);
        vertices.forEach(vertice => {
            min.x = Math.min(min.x, vertice.x);
            min.y = Math.min(min.y, vertice.y);
            max.x = Math.max(max.x, vertice.x);
            max.y = Math.max(max.y, vertice.y);
        });

        return max.add(min).scale(0.5);
    }
}