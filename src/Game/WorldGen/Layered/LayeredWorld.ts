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

export const defaultConfig: Omit<LayeredWorldConfig, 'seed'> = {
    stable: false,
    elevationConfig: {
        // Higher means more zoomed in, showing details better
        scale: 250, // Current default 200, because it looks nice
        // Higher means more levels of detail in the noise
        octaves: 3,//Default 4?
        // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
        persistence: 2,//Default 2
        // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
        lacunarity: 0.5, //Default 0.5,
    },
    moistureConfig: {
        // Higher means more zoomed in, showing details better
        scale: 1000, // Current default 250, because it looks nice
        // Higher means more levels of detail in the noise
        octaves: 4,//Default 1
        // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
        persistence: 1,//Default 2
        // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
        lacunarity: 0.5, //Default 0.5,
    },
    mapTileConfig: {
        saturation: 1.5,
        // type:TileType.Voronoi,
        type: TileType.Square,
        // type:TileType.FlatTopHexagon,
        // type:TileType.PointyTopHexagon,
    }
};

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
                return new HexagonGridPointLayer(100, 50, true);
            case TileType.PointyTopHexagon:
                return new HexagonGridPointLayer(250, 50, false);
            case TileType.Square:
                return new SquareGridPointLayer(30);
            case TileType.Voronoi:
            default:
                return new PolygonLayer(gridSize, gridSize, new RandomPointLayer(seed, gridSize, gridSize, pointsPerGrid));
        }
    }
}