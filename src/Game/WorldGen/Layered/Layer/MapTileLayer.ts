import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {PolygonMapTile} from "../../PolygonMapTile.ts";
import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";
import {Polygon} from "../../../../Utility/Area/Polygon.ts";
import {Area} from "../../../../Utility/Area/Area.ts";

export enum TileType {
    Voronoi = 'Voronoi',
    Square = 'Square',
    FlatTopHexagon = 'FlatTopHexagon',
    PointyTopHexagon = 'PointTopHexagon',
}

export type MapTileConfig = {
    saturation?: number,
    type?: TileType,
}

export class MapTileLayer extends AbstractFilteredDataLayer<PolygonMapTile> {
    private readonly handledPolygons = new Set<Polygon>();

    constructor(
        private readonly polygonLayer: AbstractFilteredDataLayer<Polygon>,
        private readonly elevationLayer: CoordinateDataLayerInterface<number>,
        private readonly moistureLayer: CoordinateDataLayerInterface<number>,
        private readonly config: MapTileConfig = {},
    ) {
        super();
    }

    getData(area: Area): Set<PolygonMapTile> {
        const mapTiles = new Set<PolygonMapTile>();

        const polygons = this.polygonLayer.getFilteredData(area, this.handledPolygons);
        for (const polygon of polygons) {
            // console.log(polygon.center.distance(area.center));
            mapTiles.add(new PolygonMapTile({
                elevation: this.elevationLayer.getData(polygon.center),
                moisture: this.moistureLayer.getData(polygon.center),
                saturation: this.config.saturation, //this.moistureLayer.getData(polygon.center),
                polygon,
            }));

            this.handledPolygons.add(polygon);
        }

        return mapTiles;
    }
}