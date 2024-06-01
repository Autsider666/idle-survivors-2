import {AreaDataLayerInterface} from "./AreaDataLayerInterface.ts";
import {Area} from "../../../../Utility/Area/Area.ts";

export abstract class AbstractFilteredDataLayer<PointData> implements AreaDataLayerInterface<PointData> {
    abstract getData(area: Area): Set<PointData>;

    public getFilteredData(area: Area, exclude: Set<PointData>): Set<PointData> {
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