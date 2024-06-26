import {Vector} from "excalibur";

export interface NeighborInterface {
    getNeighbourhoodPoints(): Vector[];

    getNeighbors():ReadonlyArray<NeighborInterface>;
}