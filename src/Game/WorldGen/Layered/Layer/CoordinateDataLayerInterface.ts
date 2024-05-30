import {Vector} from "excalibur";

export interface CoordinateDataLayerInterface<CoordinateData> {
    getData(coordinate:Vector): CoordinateData;
}