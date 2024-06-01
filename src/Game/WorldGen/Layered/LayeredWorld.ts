import {
    BoundingBox,
} from "excalibur";
import {RandomPointLayer} from "./Layer/RandomPointLayer.ts";
import {PolygonLayer} from "./Layer/PolygonLayer.ts";
import {PolygonMapTile} from "../PolygonMapTile.ts";
import {NoiseLayer} from "./Layer/NoiseLayer.ts";
import {ElevationLayer, NoiseConfig} from "./Layer/ElevationLayer.ts";
import {MapTileConfig, MapTileLayer} from "./Layer/MapTileLayer.ts";
import {BaseActor} from "../../../Actor/BaseActor.ts";

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

        const gridSize: number = 250;
        const pointsPerGrid: number = 25;
        const pointLayer = new RandomPointLayer(seed, gridSize, gridSize, pointsPerGrid);
        const polygonLayer = new PolygonLayer(gridSize, gridSize, pointLayer);
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

    readyArea(area: BoundingBox, initial: boolean = false): Set<BaseActor> {
        const newTiles = this.mapTileLayer.getFilteredData(area, this.tiles);
        newTiles.forEach(tile => {
            tile.stabilize(area.center, initial);
        });

        return newTiles;
    }
}