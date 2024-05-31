import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {PolygonMapTile} from "../../PolygonMapTile.ts";
import {BoundingBox} from "excalibur";
import {PolygonData} from "./PolygonLayer.ts";
import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";

export type MapTileConfig = {
    saturation?: number,
}

export class MapTileLayer extends AbstractFilteredDataLayer<PolygonMapTile> {
    private readonly handledPolygons = new Set<PolygonData>();

    constructor(
        private readonly polygonLayer: AbstractFilteredDataLayer<PolygonData>,
        private readonly elevationLayer: CoordinateDataLayerInterface<number>,
        private readonly moistureLayer: CoordinateDataLayerInterface<number>,
        private readonly config: MapTileConfig = {},
    ) {
        super();
    }

    getData(area: BoundingBox): Set<PolygonMapTile> {
        const mapTiles = new Set<PolygonMapTile>();

        // LayerFunction.iterateGridByArea(area, this.gridWidth, this.gridHeight, (gridX: number, gridY: number): void => {
        //     const mapTiles = this.retrieveData(area);
        //     for (const mapTile of mapTiles) {
        //         if (area.contains(mapTile.pos)) {
        //             data.add(mapTile);
        //         }
        //     }
        // });

        const polygons = this.polygonLayer.getFilteredData(area, this.handledPolygons);
        for (const polygon of polygons) {
            mapTiles.add(new PolygonMapTile({
                elevation: this.elevationLayer.getData(polygon.pos),
                moisture: this.moistureLayer.getData(polygon.pos),
                saturation: this.config.saturation,
                ...polygon,
            }));
        }

        return mapTiles;
    }
}