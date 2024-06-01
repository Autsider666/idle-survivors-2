import {Area} from "../../../../Utility/Area/Area.ts";

export interface AreaDataLayerInterface<AreaData> {
    getData(area: Area): Set<AreaData>;
}