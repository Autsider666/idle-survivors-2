import {Scene, Vector} from "excalibur";
import {LayeredWorld} from "../Game/WorldGen/Layered/LayeredWorld.ts";
import Player from "../Actor/Player.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";

export class TestScene extends Scene {
    private readonly layeredWorld: LayeredWorld;

    constructor(seed: number, private readonly  startingPosition: Vector = new Vector(0, 0)) {
        super();

        this.layeredWorld = new LayeredWorld(seed);

        this.add(this.layeredWorld);
    }

    public onInitialize() {
        const player = new Player(this.startingPosition, false);
        this.add(player);

        player.on<"postupdate">("postupdate", () => this.layeredWorld.moveTo(player.pos));

        this.camera.addStrategy(new PlayerCameraStrategy(player));
    }
}