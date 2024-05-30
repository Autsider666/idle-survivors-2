import {BaseActor} from "../../../Actor/BaseActor.ts";
import {BoundingBox, EaseTo, EasingFunctions, Engine, Fade, ParallelActions, Vector} from "excalibur";
import {ActorRenderManager} from "../../../Utility/ActorRenderManager.ts";
import {RandomPointLayer} from "./Layer/RandomPointLayer.ts";
import {PolygonData, PolygonLayer} from "./Layer/PolygonLayer.ts";
import {PolygonMapTile} from "../PolygonMapTile.ts";
import {NoiseLayer} from "./Layer/NoiseLayer.ts";
import {ElevationLayer} from "./Layer/ElevationLayer.ts";
import {CoordinateDataLayerInterface} from "./Layer/CoordinateDataLayerInterface.ts";

export class LayeredWorld extends BaseActor {
    private readonly manager: ActorRenderManager;
    private currentGridPos: Vector = new Vector(Infinity, Infinity);

    private readonly elevationLayer:CoordinateDataLayerInterface<number>;
    private readonly polygonLayer:PolygonLayer;
    private readonly polygons = new Set<PolygonData>();

    constructor(
        seed: number,
        private readonly cellSize: number = 500,
        pointsPerCell: number = 30,
    ) {
        super();

        this.manager = new ActorRenderManager(1000);

        this.elevationLayer = new ElevationLayer(
            new NoiseLayer(seed)
        );

         const pointLayer = new RandomPointLayer(seed, this.cellSize, this.cellSize, pointsPerCell);
        this.polygonLayer = new PolygonLayer(this.cellSize, this.cellSize, pointLayer);
    }

    onPostUpdate(engine: Engine) {
        this.manager.check(engine, 200); //TODO move to listener?
    }

    onInitialize(engine: Engine) {
        this.manager.setScene(engine.currentScene);

        this.moveTo(Vector.Zero, true);
    }

    moveTo(location: Vector, initial:boolean = false): void {
        if (this.currentGridPos.x === Math.floor(location.x) && this.currentGridPos.y === Math.floor(location.y)) {
            return;
        }

        const polygons = this.polygonLayer.getFilteredData(BoundingBox.fromDimension(
            this.cellSize,
            this.cellSize,
            Vector.Half,
            location,
        ), this.polygons);

        polygons.forEach(polygon => {
            this.polygons.add(polygon);
            const tile = new PolygonMapTile({
                ...polygon,
                elevation: this.elevationLayer.getData(polygon.pos),
                moisture: 0.5,
            });

            if (!initial && location.distance(tile.pos) > this.cellSize/2) {
                const originalPos = tile.pos.clone();
                const fadeVector = tile.pos.sub(location).normalize().scale(this.cellSize/15);
                tile.pos = tile.pos.add(fadeVector);

                tile.graphics.opacity = 0;

                const fadeIn = new ParallelActions([
                    new Fade(tile, 1,500),
                    new EaseTo(tile,originalPos.x,originalPos.y,300,EasingFunctions.EaseInQuad)
                ]);
                tile.actions.runAction(fadeIn);
            }

            this.manager.add(tile);
        });

        this.currentGridPos.x = Math.floor(location.x);
        this.currentGridPos.y = Math.floor(location.y);
    }
}