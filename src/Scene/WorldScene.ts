import {BoundingBox, Engine, Scene, SceneActivationContext, Vector} from "excalibur";
import {LayeredWorld, LayeredWorldConfig} from "../Game/WorldGen/Layered/LayeredWorld.ts";
import Player from "../Actor/Player.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";
// @ts-expect-error It's for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";
import {ActorRenderManager} from "../Utility/ActorRenderManager.ts";

export type WorldSceneData = {
    world:LayeredWorldConfig,
}

export class WorldScene extends Scene {
    private readonly actorManager: ActorRenderManager = new ActorRenderManager(this,1000);
    private layeredWorld?: LayeredWorld;
    private player: Player;

    constructor() {
        super();

        this.player = new Player(Vector.Zero, false);

        this.player.on<"postupdate">("postupdate", this.generateWorld.bind(this));

        this.actorManager = new ActorRenderManager(this,1000);
    }

    onPostUpdate(engine: Engine) {
        this.actorManager.check(engine);
    }

    public onInitialize() {
        this.add(this.player);
    }

    public onActivate({data}: SceneActivationContext<WorldSceneData>) {
        if (data === undefined) {
            throw new Error('WorldScene config is required.');
        }

        this.world.clearEntities();

        this.actorManager.reset();

        this.layeredWorld = new LayeredWorld(data.world);

        this.actorManager.add(this.player);

        this.camera.clearAllStrategies();

        this.camera.addStrategy(new PlayerCameraStrategy(this.player, 0.02));
    }

    private generateWorld(): void {
        const stabilityRadius = 500; //TODO make this player dependant?
        const playerArea = BoundingBox.fromDimension(stabilityRadius, stabilityRadius, Vector.Half, this.player.pos);
        this.layeredWorld?.readyArea(playerArea).forEach(tile => this.actorManager.add(tile));
    }
}