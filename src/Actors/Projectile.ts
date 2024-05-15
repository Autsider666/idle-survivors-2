import { Actor, CollisionType, Color, Engine, Vector } from "excalibur";
import { SCALE_2x } from "../Utility/Game";
import { PlayerCollisionGroup } from "./Player";

export class Projectile extends Actor {
    private msRemaining: number = 2000;
    private velosity: number = 300;

    constructor(origin: Actor, target: Actor, color: Color) {
        super({
            pos: origin.getGlobalPos().clone(),
            scale: SCALE_2x,
            radius: 2,
            color,

            collisionType: CollisionType.Passive,
            collisionGroup: PlayerCollisionGroup,
        });

        // this.vel.x = direction.x;
        // this.vel.y = direction.y;

        this.actions.moveTo(target.getGlobalPos().clone(), this.velosity);

        this.on("collisionstart", ({ other }) => {
            this.actions.clearActions();
            this.actions.die();
        })
    }
}