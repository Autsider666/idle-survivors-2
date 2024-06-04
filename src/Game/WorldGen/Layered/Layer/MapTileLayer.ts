import {AbstractFilteredDataLayer} from "./AbstractFilteredDataLayer.ts";
import {PolygonMapTile} from "../../PolygonMapTile.ts";
import {CoordinateDataLayerInterface} from "./CoordinateDataLayerInterface.ts";
import {Polygon} from "../../../../Utility/Geometry/Polygon.ts";
import {Shape} from "../../../../Utility/Geometry/Shape.ts";
import {Neighbourhood} from "../../Neighbourhood.ts";
import {BoundingBox} from "excalibur";

export enum TileType {
    Voronoi = 'Voronoi',
    Square = 'Square',
    FlatTopHexagon = 'FlatTopHexagon',
    PointyTopHexagon = 'PointTopHexagon',
}

export type MapTileConfig = {
    saturation?: number,
    type?: TileType,
    outerBounds?: BoundingBox,
}

export class MapTileLayer extends AbstractFilteredDataLayer<PolygonMapTile> {
    private readonly handledPolygons = new Set<Polygon>();
    private readonly neighborhood = new Neighbourhood<PolygonMapTile>();

    constructor(
        private readonly polygonLayer: AbstractFilteredDataLayer<Polygon>,
        private readonly elevationLayer: CoordinateDataLayerInterface<number>,
        private readonly moistureLayer: CoordinateDataLayerInterface<number>,
        private readonly config: MapTileConfig = {},
    ) {
        super();
    }

    getData(area: Shape): Set<PolygonMapTile> {
        const mapTiles = new Set<PolygonMapTile>();
        const polygons = this.polygonLayer.getFilteredData(area, this.handledPolygons);
        for (const polygon of polygons) {
            if (this.config.outerBounds && !this.config.outerBounds.contains(polygon.center)) {
                continue;
            }

            mapTiles.add(new PolygonMapTile({
                elevation: this.elevationLayer.getData(polygon.center),
                moisture: this.moistureLayer.getData(polygon.center),
                saturation: this.config.saturation, //this.moistureLayer.getData(polygon.center),
                polygon,
            }, this.neighborhood));

            this.handledPolygons.add(polygon);
        }

        return mapTiles;
    }
}