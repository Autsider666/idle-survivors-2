import {
    BoundingBox,
    Engine,
    Scene,
    SceneActivationContext,
    Vector,
} from "excalibur";
import {defaultConfig, LayeredWorld, LayeredWorldConfig} from "../Game/WorldGen/Layered/LayeredWorld.ts";
import Player from "../Actor/Player.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";
import {MONSTER_SPAWN_TAG, MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";
import {ActorRenderManager} from "../Utility/ActorRenderManager.ts";
import {Shape} from "../Utility/Geometry/Shape.ts";
import {PUNISHABLE_TAG, PunishmentSystem} from "../System/PunishmentSystem.ts";
import {Neighbourhood} from "../Game/WorldGen/Neighbourhood.ts";
import {PolygonMapTile} from "../Game/WorldGen/PolygonMapTile.ts";
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import {CellularAutomatonSystem} from "../System/CellularAutomatonSystem.ts";
import {Polygon} from "../Utility/Geometry/Polygon.ts";
import {INFECTABLE_TAG, InfectionSpawnerSystem} from "../System/InfectionSpawnerSystem.ts";
import {GridComponent} from "../Component/GridComponent.ts";

export type ArenaSceneData = {
    player: Player,
    world: Partial<LayeredWorldConfig> & { seed: number },
}

export class ArenaScene extends Scene {
    private readonly actorManager: ActorRenderManager;
    private layeredWorld?: LayeredWorld;
    private readonly neighborhood = new Neighbourhood<PolygonMapTile>();

    constructor() {
        super();

        this.world.add(MonsterSpawnSystem);
        this.world.add(PunishmentSystem);
        this.world.add(CellularAutomatonSystem);
        this.world.add(InfectionSpawnerSystem);

        this.actorManager = new ActorRenderManager(this);
    }

    onPostUpdate(engine: Engine) {
        this.actorManager.check(engine);
    }

    public onActivate({data}: SceneActivationContext<ArenaSceneData>): void {
        if (data === undefined) {
            throw new Error('WorldScene config is required.');
        }

        const arenaWidth: number = 500;
        const arenaHeight: number = 500;
        const tileSize:number = 25;

        const outerBounds = BoundingBox.fromDimension(arenaWidth, arenaHeight, Vector.Half, Vector.Zero);

        const {world} = data;

        const player = new Player(Vector.Zero,false);
        // player.pos = new Vector(-230,-230);
        player.addComponent(new GridComponent(tileSize));
        const config = cloneDeep(defaultConfig);

        this.layeredWorld = new LayeredWorld(merge(config, world, {tileSize}));
        this.generateWorld(new Polygon(outerBounds.center, outerBounds.getPoints()),tile => {
            tile.addTag(INFECTABLE_TAG);
            tile.addComponent(new GridComponent(tileSize));
        });

        this.actorManager.add(player);

        this.camera.clearAllStrategies();

        this.camera.addStrategy(new PlayerCameraStrategy(player, 0.04));
    }

    onDeactivate(): void {
        this.world.clearEntities();

        this.actorManager.reset();
    }

    private generateWorld(area: Shape, callback?: (tile: PolygonMapTile) => void): void {
        const world = this.layeredWorld;
        if(world === undefined) {
            throw new Error('Cannot generate world before a world is initialized');
        }

        this.layeredWorld?.readyArea(area, tile => {
            if (tile.isSafe()) {
                tile.addTag(MONSTER_SPAWN_TAG);
            }

            tile.addTag(PUNISHABLE_TAG);
            this.neighborhood.add(tile);
            if (callback) {
                callback(tile);
            }

            // this.actorManager.add(tile);
            this.add(tile);
        }).forEach(tile => {
            if (this.neighborhood.getNeighbors(tile).length === 0) {
                throw new Error('Tile can\'t exist without neighbors');
            }
        });
    }
}