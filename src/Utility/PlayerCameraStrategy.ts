import { CameraStrategy, Vector } from "excalibur";
import Player from "../Actor/Player";
import {MapGenFunction} from "../Game/WorldGen/MapGenFunction.ts";


export default class PlayerCameraStrategy implements CameraStrategy<Player> {
    private readonly cameraPosition: Vector;

    constructor(public target: Player, private readonly cameraSpeed:number) {
        this.cameraPosition = target.pos.clone();
    }

    action(): Vector {
        const distance = this.cameraPosition.distance(this.target.pos);
        if (distance > 2) {
            this.cameraPosition.x = MapGenFunction.lerp(this.cameraPosition.x, this.target.pos.x, this.cameraSpeed);
            this.cameraPosition.y = MapGenFunction.lerp(this.cameraPosition.y, this.target.pos.y, this.cameraSpeed);
        }

        return this.cameraPosition;
    }
}