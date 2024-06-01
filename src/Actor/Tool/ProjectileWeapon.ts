import { CollisionType, Color } from "excalibur";
import { RangedComponent } from "../../Component/RangedComponent.ts";
import { BaseActor } from "../BaseActor.ts";
import { CollisionGroup } from "../../Game/CollisionGroups.ts";

type Props = {
    name: string,
    range: number,
    color: Color,
    rateOfFire?: number,
    pierce?: number,
}

export class ProjectileWeapon extends BaseActor {

    constructor(
        {
            name = 'Weapon',
            range = 150,
            color = Color.White,
            rateOfFire = 2,
            pierce = 0,
        }:Props,
    ) {
        super({
            name,
            radius: range,
            opacity: 0.6,
            z: -1,
            collisionType: CollisionType.Passive,
            collisionGroup: CollisionGroup.Weapon,
        });

        this.addComponent(new RangedComponent({
            range,
            color,
            rateOfFire,
            pierce,
        }));

    }
}