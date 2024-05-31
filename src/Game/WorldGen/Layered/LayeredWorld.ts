import {BaseActor} from "../../../Actor/BaseActor.ts";
import {BoundingBox, EaseTo, EasingFunctions, Engine, Fade, ParallelActions, Vector} from "excalibur";
import {ActorRenderManager} from "../../../Utility/ActorRenderManager.ts";
import {RandomPointLayer} from "./Layer/RandomPointLayer.ts";
import {PolygonData, PolygonLayer} from "./Layer/PolygonLayer.ts";
import {PolygonMapTile} from "../PolygonMapTile.ts";
import {NoiseLayer} from "./Layer/NoiseLayer.ts";
import {ElevationLayer} from "./Layer/ElevationLayer.ts";
import {CoordinateDataLayerInterface} from "./Layer/CoordinateDataLayerInterface.ts";
import {MapGenFunction} from "../MapGenFunction.ts";

const mapGenData = {
    // Higher means more zoomed in, showing details better
    scale: 250, // Current default 200, because it looks nice
    // Higher means more levels of detail in the noise
    octaves: 3,//Default 4?
    // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
    persistence: 2,//Default 2
    // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
    lacunarity: 0.5, //Default 0.5,
};

export class LayeredWorld extends BaseActor {
    private readonly manager: ActorRenderManager;
    private currentGridPos: Vector = new Vector(Infinity, Infinity);

    private readonly elevationLayer: CoordinateDataLayerInterface<number>;
    private readonly polygonLayer: PolygonLayer;
    private readonly polygons = new Set<PolygonData>();

    constructor(
        seed: number,
        private readonly fieldOfViewSize: number = 500,
        private readonly cellSize: number = 250,
        pointsPerCell: number = 25,
    ) {
        super();

        this.manager = new ActorRenderManager(1000);

        this.elevationLayer = new ElevationLayer(
            new NoiseLayer(seed),
            mapGenData.scale,
            mapGenData.lacunarity,
            mapGenData.persistence,
            mapGenData.octaves,
        );

        const pointLayer = new RandomPointLayer(seed, this.cellSize, this.cellSize, pointsPerCell);
        this.polygonLayer = new PolygonLayer(this.cellSize, this.cellSize, pointLayer);
    }

    onPostUpdate(engine: Engine) {
        this.manager.check(engine); //TODO move to listener?
    }

    onInitialize(engine: Engine) {
        this.manager.setScene(engine.currentScene);

        this.moveTo(Vector.Zero, true);
    }

    moveTo(playerLocation: Vector, initial: boolean = false): void {
        if (this.currentGridPos.x === Math.floor(playerLocation.x) && this.currentGridPos.y === Math.floor(playerLocation.y)) {
            return;
        }

        const polygons = this.polygonLayer.getFilteredData(BoundingBox.fromDimension(
            this.fieldOfViewSize,
            this.fieldOfViewSize,
            Vector.Half,
            playerLocation,
        ), this.polygons);

        polygons.forEach(polygon => {
            this.polygons.add(polygon);

            // Idea for elevation: MapGenFunction.lerp(elevation,1,0.2)
            const tile = new PolygonMapTile({
                ...polygon,
                elevation: this.elevationLayer.getData(polygon.pos),
                moisture: 0.5,
                saturation: 1.5,
            });

            const distance = playerLocation.distance(tile.pos);
            if (!initial && distance > this.cellSize / 2) {
                const originalPos = tile.pos.clone();
                const fadeVector = tile.pos.sub(playerLocation).normalize().scale(this.cellSize / 15);
                tile.pos = tile.pos.add(fadeVector);

                tile.graphics.opacity = 0;
                // tile.scale = new Vector(2,2);

                const fadeIn = new ParallelActions([
                    // new ScaleTo(tile,1,1,1.5,1.5),
                    new Fade(tile, 1, MapGenFunction.lerp(distance, 500, 0.8)),
                    new EaseTo(tile, originalPos.x, originalPos.y, MapGenFunction.lerp(distance, 500, 0.4), EasingFunctions.EaseInQuad)
                ]);
                tile.actions.runAction(fadeIn);
            }

            this.manager.add(tile);
        });

        this.currentGridPos.x = Math.floor(playerLocation.x);
        this.currentGridPos.y = Math.floor(playerLocation.y);
    }
}