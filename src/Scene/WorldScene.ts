import {Engine, Scene, SceneActivationContext} from "excalibur";
import {defaultConfig, LayeredWorld, LayeredWorldConfig} from "../Game/WorldGen/Layered/LayeredWorld.ts";
import Player from "../Actor/Player.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";
import {MONSTER_SPAWN_TAG, MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";
import {ActorRenderManager} from "../Utility/ActorRenderManager.ts";
import {Circle} from "../Utility/Area/Circle.ts";
import {Area} from "../Utility/Area/Area.ts";
import {PUNISHABLE_TAG, PunishmentSystem} from "../System/PunishmentSystem.ts";

export type WorldSceneData = {
    player:Player,
    world: Partial<LayeredWorldConfig> & {seed:number},
}

export class WorldScene extends Scene {
    private readonly actorManager: ActorRenderManager = new ActorRenderManager(this);
    private layeredWorld?: LayeredWorld;

    constructor() {
        super();

        this.world.add(MonsterSpawnSystem);
        this.world.add(PunishmentSystem);
    }

    onPostUpdate(engine: Engine) {
        this.actorManager.check(engine);
    }

    public onActivate({data}: SceneActivationContext<WorldSceneData>) {
        if (data === undefined) {
            throw new Error('WorldScene config is required.');
        }

        const player = data.player;

        const stabilityRadius = 150; //TODO make this player dependant?

        player.on<"postupdate">("postupdate", () => this.generateWorld(new Circle(player.pos.clone(), stabilityRadius)));

        this.world.clearEntities();

        this.actorManager.reset();

        this.layeredWorld = new LayeredWorld({...defaultConfig, ...data.world});

        this.actorManager.add(player);

        this.camera.clearAllStrategies();

        this.camera.addStrategy(new PlayerCameraStrategy(player, 0.04));
    }

    private generateWorld(area: Area): void {
        // const fullscreen = this.engine.screen.getWorldBounds();
        this.layeredWorld?.readyArea(area, tile => {
            this.actorManager.add(tile);
            tile.stabilize(area.center); //TODO move to component, because this is acting up way too often

            if(tile.isSafe()) {
                tile.addTag(MONSTER_SPAWN_TAG);
            }

            tile.addTag(PUNISHABLE_TAG);
        });
    }
}