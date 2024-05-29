import {DataLayerInterface} from "./DataLayerInterface.ts";
import {BoundingBox} from "excalibur";
import {PolygonData} from "./PolygonLayer.ts";

export abstract class AbstractFilteredDataLayer<PointData> implements DataLayerInterface<PointData> {
    abstract getData(area: BoundingBox): Set<PointData>;

    public getFilteredData(area:BoundingBox,exclude:Set<PointData>):Set<PointData> {
        const data = this.getData(area);
        const result = new Set<PolygonData>();
        for (const pointData of data) {
            if (exclude.has(pointData)) {
                continue;
            }

            result.add(pointData)
        }

        return result;
    }
}