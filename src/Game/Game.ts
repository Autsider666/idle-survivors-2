import {Color, Engine} from "excalibur";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy";
import Player from "../Actor/Player";
import { WorldMap } from "./WorldGen/WorldMap";
import {MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";
import {Weapon} from "../Actor/Tool/Weapon.ts";
import {ItemCollector} from "../Actor/Tool/ItemCollector.ts";
import {NetworkClient} from "../Multiplayer/NetworkClient.ts";
import {NetworkActorManager} from "../Multiplayer/NetworkActorManager.ts";


const urlParams = new URLSearchParams(window.location.search);

export default class Game extends Engine {
    constructor(private readonly seed:number = Number.parseInt(urlParams.get('game') ?? Date.now().toString())) {
        super({
            // width: VIEWPORT_WIDTH * VIEWPORT_SCALE,
            // height: VIEWPORT_HEIGHT * VIEWPORT_SCALE,
            // fixedUpdateFps: 60,
            // antialiasing: false,
            // pixelArt: true,
            // displayMode: DisplayMode.FitScreenAndFill
        });
    }

    onInitialize(engine: Engine) {
        super.onInitialize(engine);

        const client = new NetworkClient(engine, this.seed);
        new NetworkActorManager(engine);

        client.init();

        this.add(new WorldMap(this.seed));

        const player = new Player(1000, 1000);
        this.add(player);

        const collector = new ItemCollector(100);
        player.addChild(collector);

        this.currentScene.world.add(MonsterSpawnSystem);

        this.currentScene.camera.addStrategy(new PlayerCameraStrategy(player));
    }
}