import {
    Engine,
    Scene,
    SceneActivationContext,
} from "excalibur";
import {defaultConfig, LayeredWorld, LayeredWorldConfig} from "../Game/WorldGen/Layered/LayeredWorld.ts";
import Player from "../Actor/Player.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";
import {MONSTER_SPAWN_TAG, MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";
import {ActorRenderManager} from "../Utility/ActorRenderManager.ts";
import {Circle} from "../Utility/Geometry/Circle.ts";
import {Shape} from "../Utility/Geometry/Shape.ts";
import {PUNISHABLE_TAG, PunishmentSystem} from "../System/PunishmentSystem.ts";
import {Neighbourhood} from "../Game/WorldGen/Neighbourhood.ts";
import {PolygonMapTile} from "../Game/WorldGen/PolygonMapTile.ts";
import {UnstableComponent} from "../Component/UnstableComponent.ts";
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import {CellularAutomatonSystem} from "../System/CellularAutomatonSystem.ts";

export type WorldSceneData = {
    player: Player,
    world: Partial<LayeredWorldConfig> & { seed: number },
}

export class WorldScene extends Scene {
    private readonly actorManager: ActorRenderManager;
    private layeredWorld?: LayeredWorld;
    private readonly neighborhood = new Neighbourhood<PolygonMapTile>();

    constructor() {
        super();

        this.world.add(MonsterSpawnSystem);
        this.world.add(PunishmentSystem);
        this.world.add(CellularAutomatonSystem);

        this.actorManager = new ActorRenderManager(this);
    }

    onPostUpdate(engine: Engine) {
        this.actorManager.check(engine);
    }

    public onActivate({data}: SceneActivationContext<WorldSceneData>): void {
        if (data === undefined) {
            throw new Error('WorldScene config is required.');
        }

        const {player, world} = data;

        const stabilityRadius = 200; //TODO make this player dependant?
        const unstabilityRadius = 400;

        player.on<"postupdate">("postupdate", () => this.generateWorld(
            new Circle(player.pos.clone(), stabilityRadius * 2),
            tile => tile.addComponent(new UnstableComponent(player, stabilityRadius,unstabilityRadius))
        ));

        const config = cloneDeep(defaultConfig);

        this.layeredWorld = new LayeredWorld(merge(config, world));

        this.actorManager.add(player);

        this.camera.clearAllStrategies();

        this.camera.addStrategy(new PlayerCameraStrategy(player, 0.04));
    }

    onDeactivate(): void {
        this.world.clearEntities();

        this.actorManager.reset();
    }

    private generateWorld(area: Shape, callback:(tile:PolygonMapTile)=>void): void {
        this.layeredWorld?.readyArea(area, tile => {
            this.actorManager.add(tile);

            if (tile.isSafe()) {
                tile.addTag(MONSTER_SPAWN_TAG);
            }

            tile.addTag(PUNISHABLE_TAG);
            this.neighborhood.add(tile);
            callback(tile);
        }).forEach(tile => {
            if (this.neighborhood.getNeighbors(tile).length === 0) {
                throw new Error('Tile can\'t exist without neighbors');
            }
        });
    }
}