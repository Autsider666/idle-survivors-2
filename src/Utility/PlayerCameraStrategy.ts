import { CameraStrategy, Vector } from "excalibur";
import Player from "../Actor/Player";

const CAMERA_SPEED = 0.04;

export default class PlayerCameraStrategy implements CameraStrategy<Player> {
    private position: Vector;

    constructor(public readonly target: Player) { //TODO
        this.position = new Vector(target.pos.x, target.pos.y);
    }

    action(): Vector {
        const distance = this.position.distance(this.target.pos);
        if (distance > 2) {
            this.position.x = this.lerp(this.position.x, this.target.pos.x, CAMERA_SPEED);
            this.position.y = this.lerp(this.position.y, this.target.pos.y, CAMERA_SPEED);
        }

        // // Limits
        // const R_LIMIT = this.map.tileWidth * VIEWPORT_SCALE * 16 - 7 * VIEWPORT_SCALE * 16;
        // this.position.x = this.position.x > R_LIMIT ? R_LIMIT : this.position.x;

        // const L_LIMIT = 8 * VIEWPORT_SCALE * 16;
        // this.position.x = this.position.x < L_LIMIT ? L_LIMIT : this.position.x;

        // const D_LIMIT = this.map.tileHeight * VIEWPORT_SCALE * 16 - 5 * VIEWPORT_SCALE * 16;
        // this.position.y = this.position.y > D_LIMIT ? D_LIMIT : this.position.y;

        // const U_LIMIT = 7 * VIEWPORT_SCALE * 16;
        // this.position.y = this.position.y < U_LIMIT ? U_LIMIT : this.position.y;

        return this.position;
    }

    private lerp(currentValue: number, destinationValue: number, speed: number): number {
        return currentValue * (1 - speed) + destinationValue * speed;
    }
}