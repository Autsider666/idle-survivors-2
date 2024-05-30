import {BoundingBox} from "excalibur";

export interface DataLayerInterface<PointData> {
    getData(area: BoundingBox): Set<PointData>;
}