import { Actor, CollisionType, Color } from "excalibur";
import { PlayerCollisionGroup } from "./Player";
import { RangedComponent } from "../Component/RangedComponent";

export class Weapon extends Actor {

    constructor(
        range: number = 150,
        projectileColor: Color = Color.White,
        rateOfFire: number = 2
    ) {
        super({
            radius: range,
            opacity: 0.6,
            z: -1,
            collisionType: CollisionType.Passive,
            collisionGroup: PlayerCollisionGroup,
        });

        this.addComponent(new RangedComponent({
            range,
            projectileColor,
            rateOfFire,
        }));

    }
}