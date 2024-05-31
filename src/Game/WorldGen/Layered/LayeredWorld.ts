import {BaseActor} from "../../../Actor/BaseActor.ts";
import {
    BoundingBox,
    Engine,
} from "excalibur";
import {ActorRenderManager} from "../../../Utility/ActorRenderManager.ts";
import {RandomPointLayer} from "./Layer/RandomPointLayer.ts";
import {PolygonLayer} from "./Layer/PolygonLayer.ts";
import {PolygonMapTile} from "../PolygonMapTile.ts";
import {NoiseLayer} from "./Layer/NoiseLayer.ts";
import {ElevationLayer, NoiseConfig} from "./Layer/ElevationLayer.ts";
import {MapTileConfig, MapTileLayer} from "./Layer/MapTileLayer.ts";

export type LayeredWorldConfig = {
    seed: number,
    stable: boolean,
    elevationConfig: NoiseConfig,
    moistureConfig: NoiseConfig,
    mapTileConfig?: MapTileConfig,
}

export class LayeredWorld extends BaseActor {
    private readonly manager: ActorRenderManager;

    private readonly mapTileLayer: MapTileLayer;
    private readonly tiles = new Set<PolygonMapTile>();

    constructor(config: LayeredWorldConfig) {
        super();

        const {seed, elevationConfig, moistureConfig, mapTileConfig} = config;

        this.manager = new ActorRenderManager(1000);

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

    onPostUpdate(engine: Engine) {
        this.manager.check(engine);
    }

    onInitialize(engine: Engine) {
        this.manager.setScene(engine.currentScene);
    }

    readyArea(area:BoundingBox, initial: boolean = false): void {
        this.mapTileLayer.getFilteredData(area, this.tiles).forEach(tile => {
            tile.stabilize(area.center,initial);

            this.manager.add(tile);
        });
    }
}