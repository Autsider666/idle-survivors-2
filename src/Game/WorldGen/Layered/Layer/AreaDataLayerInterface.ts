import {BoundingBox} from "excalibur";

export interface AreaDataLayerInterface<AreaData> {
    getData(area: BoundingBox): Set<AreaData>;
}