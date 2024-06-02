import {RandomPointLayer} from "./Layer/RandomPointLayer.ts";
import {PolygonLayer} from "./Layer/PolygonLayer.ts";
import {PolygonMapTile} from "../PolygonMapTile.ts";
import {NoiseLayer} from "./Layer/NoiseLayer.ts";
import {ElevationLayer, NoiseConfig} from "./Layer/ElevationLayer.ts";
import {MapTileConfig, MapTileLayer, TileType} from "./Layer/MapTileLayer.ts";
import {BaseActor} from "../../../Actor/BaseActor.ts";
import {Area} from "../../../Utility/Area/Area.ts";
import {SquareGridPointLayer} from "./Layer/SquareGridPointLayer.ts";
import {Polygon} from "../../../Utility/Area/Polygon.ts";
import {AbstractFilteredDataLayer} from "./Layer/AbstractFilteredDataLayer.ts";
import {HexagonGridPointLayer} from "./Layer/HexagonGridPointLayer.ts";

export type LayeredWorldConfig = {
    seed: number,
    stable: boolean,
    elevationConfig: NoiseConfig,
    moistureConfig: NoiseConfig,
    mapTileConfig?: MapTileConfig,
}

export class LayeredWorld {
    private readonly mapTileLayer: MapTileLayer;
    private readonly tiles = new Set<PolygonMapTile>();

    constructor(config: LayeredWorldConfig) {
        const {seed, elevationConfig, moistureConfig, mapTileConfig} = config;


        const polygonLayer = this.generatePolygonLayer(config);
        const elevationLayer = new ElevationLayer(
            new NoiseLayer(seed),
            elevationConfig,
        );
        const moistureLayer = new ElevationLayer(
            new NoiseLayer(seed + 1),
            moistureConfig,
        );

        this.mapTileLayer = new MapTileLayer(
            polygonLayer,
            elevationLayer,
            moistureLayer,
            mapTileConfig,
        );
    }

    readyArea(area: Area, onNew?: (tile: PolygonMapTile) => void): Set<BaseActor> {
        const newTiles = this.mapTileLayer.getFilteredData(area, this.tiles);
        newTiles.forEach(tile => {
            this.tiles.add(tile);
            if (onNew) {
                onNew(tile);
            }

        });

        return newTiles;
    }

    private generatePolygonLayer({mapTileConfig, seed}: LayeredWorldConfig): AbstractFilteredDataLayer<Polygon> {
        const gridSize: number = 250;
        const pointsPerGrid: number = 50;

        switch (mapTileConfig?.type) {
            case TileType.FlatTopHexagon:
                return new HexagonGridPointLayer(100,50,true);
            case TileType.PointyTopHexagon:
                return new HexagonGridPointLayer(250,50,false);
            case TileType.Square:
                return new SquareGridPointLayer(30);
            case TileType.Voronoi:
            default:
                return new PolygonLayer(gridSize, gridSize, new RandomPointLayer(seed, gridSize, gridSize, pointsPerGrid));
        }
    }
}