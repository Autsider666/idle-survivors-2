import {BoundingBox, Scene, Vector} from "excalibur";
import {LayeredWorld} from "../Game/WorldGen/Layered/LayeredWorld.ts";
import Player from "../Actor/Player.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";
// @ts-expect-error It's for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";

export class TestScene extends Scene {
    private readonly layeredWorld: LayeredWorld;

    constructor(seed: number, private readonly startingPosition: Vector = new Vector(0, 0)) {
        super();

        this.layeredWorld = new LayeredWorld({
            seed,
            stable: false,
            elevationConfig: {
                // Higher means more zoomed in, showing details better
                scale: 250, // Current default 200, because it looks nice
                // Higher means more levels of detail in the noise
                octaves: 3,//Default 4?
                // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
                persistence: 2,//Default 2
                // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
                lacunarity: 0.5, //Default 0.5,
            },
            moistureConfig: {
                // Higher means more zoomed in, showing details better
                scale: 250, // Current default 200, because it looks nice
                // Higher means more levels of detail in the noise
                octaves: 1,//Default 4?
                // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
                persistence: 2,//Default 2
                // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
                lacunarity: 0.5, //Default 0.5,
            }
        });

        this.add(this.layeredWorld);

        // this.world.add(MonsterSpawnSystem);
    }

    public onInitialize() {
        const player = new Player(this.startingPosition, false);
        this.add(player);

        const stabilityRadius = 500;

        const playerArea = BoundingBox.fromDimension(stabilityRadius,stabilityRadius,Vector.Half,player.pos);
        this.layeredWorld.readyArea(playerArea);
        player.on<"postupdate">("postupdate", () => {
            this.layeredWorld.readyArea(playerArea.translate(player.pos));
        });

        this.camera.addStrategy(new PlayerCameraStrategy(player));
    }
}