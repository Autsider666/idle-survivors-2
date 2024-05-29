import {BoundingBox} from "excalibur";

export interface DataLayer<PointData> {
    getData(area:BoundingBox):PointData;
}