import {Shape} from "../../../../Utility/Geometry/Shape.ts";

export interface AreaDataLayerInterface<AreaData> {
    getData(area: Shape): Set<AreaData>;
}