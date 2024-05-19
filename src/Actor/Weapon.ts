import { CollisionType, Color } from "excalibur";
import { RangedComponent } from "../Component/RangedComponent";
import { BaseActor } from "./BaseActor";
import { CollisionGroup } from "../Game/CollisionGroups";

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
            collisionGroup: CollisionGroup.Weapon,
        });

        this.addComponent(new RangedComponent({
            range,
            projectileColor,
            rateOfFire,
        }));

    }
}