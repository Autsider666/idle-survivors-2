import {Vector} from "excalibur";

export interface MapTileInterface {
    stabilize(sourceLocation:Vector): void;
    destabilize(sourceLocation:Vector): void;
}