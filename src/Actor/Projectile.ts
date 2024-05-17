import { Actor, CollisionType, Color } from "excalibur";
import { SCALE_2x } from "../Utility/Game";
import { PlayerCollisionGroup } from "./Player";
import { DamageComponent } from "../Component/DamageComponent";

export class Projectile extends Actor {
    // private msRemaining: number = 2000;
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

        this.actions.moveTo(target.getGlobalPos().clone(), this.velosity).die();

        this.addComponent(new DamageComponent({ amount: 1, killAfterHits: 1 }));
    }
}