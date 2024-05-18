import { Color, DisplayMode, Engine } from "excalibur";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy";
import Player from "../Actor/Player";
import { Weapon } from "../Actor/Weapon";
import { MonsterSpawnSystem } from "../System/MonsterSpawnSystem";

export default class Game extends Engine {
    constructor() {
        super({
            // width: VIEWPORT_WIDTH * VIEWPORT_SCALE,
            // height: VIEWPORT_HEIGHT * VIEWPORT_SCALE,
            // fixedUpdateFps: 60,
            // antialiasing: false,
            pixelArt: true,
            displayMode: DisplayMode.FitScreenAndFill
        });
    }

    onInitialize(engine: Engine) {
        super.onInitialize(engine);

        const player = new Player(0, 0);
        this.add(player);

        const weapon2 = new Weapon(150, Color.Magenta, 3);
        player.addChild(weapon2);

        const weapon1 = new Weapon(50, Color.White, 10);
        player.addChild(weapon1);

        this.currentScene.world.add(MonsterSpawnSystem);

        this.currentScene.camera.addStrategy(new PlayerCameraStrategy(player));
    }
}