import { CollisionType, Color } from "excalibur";
import { PlayerCollisionGroup } from "./Player";
import { RangedComponent } from "../Component/RangedComponent";
import { BaseActor } from "./BaseActor";

export class Weapon extends BaseActor {

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