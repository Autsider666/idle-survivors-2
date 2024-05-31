import {AreaDataLayerInterface} from "./AreaDataLayerInterface.ts";
import {BoundingBox} from "excalibur";

export abstract class AbstractFilteredDataLayer<PointData> implements AreaDataLayerInterface<PointData> {
    abstract getData(area: BoundingBox): Set<PointData>;

    public getFilteredData(area: BoundingBox, exclude: Set<PointData>): Set<PointData> {
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