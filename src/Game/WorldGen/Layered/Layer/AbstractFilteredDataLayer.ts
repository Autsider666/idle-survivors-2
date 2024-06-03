import {AreaDataLayerInterface} from "./AreaDataLayerInterface.ts";
import {Shape} from "../../../../Utility/Geometry/Shape.ts";

export abstract class AbstractFilteredDataLayer<PointData> implements AreaDataLayerInterface<PointData> {
    abstract getData(area: Shape): Set<PointData>;

    public getFilteredData(area: Shape, exclude: Set<PointData>): Set<PointData> {
        const data = this.getData(area);
        const result = new Set<PointData>();
        for (const pointData of data) {
            if (exclude.has(pointData)) {
                continue;
            }

            result.add(pointData);
        }

        return result;
    }
}