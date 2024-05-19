import { Color, DisplayMode, Engine } from "excalibur";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy";
import Player from "../Actor/Player";
import { Weapon } from "../Actor/Weapon";
import { MonsterSpawnSystem } from "../System/MonsterSpawnSystem";
import { OrbitingWeapon } from "../Actor/OrbitingWeapon";
import { WorldMap } from "./WorldGen/WorldMap";

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

        this.add(new WorldMap());

        const player = new Player(1000, 1000);
        this.add(player);

        const orbitingWeapon1 = new OrbitingWeapon({ projectiles: 4, range: 150, rps: 0.6, damage: 1 });
        player.addChild(orbitingWeapon1);

        const orbitingWeapon2 = new OrbitingWeapon({ projectiles: 10, range: 200, rps: 0.1, clockwise: false });
        player.addChild(orbitingWeapon2);

        const weapon2 = new Weapon(150, Color.Magenta, 3);
        player.addChild(weapon2);

        const weapon1 = new Weapon(50, Color.White, 10);
        player.addChild(weapon1);

        this.currentScene.world.add(MonsterSpawnSystem);

        this.currentScene.camera.addStrategy(new PlayerCameraStrategy(player));
    }
}