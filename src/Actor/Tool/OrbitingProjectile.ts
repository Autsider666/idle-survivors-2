import { CollisionType, Color } from "excalibur";
import { OrbitingComponent } from "../../Component/OrbitingComponent.ts";
import { BaseActor } from "../BaseActor.ts";
import { CollisionGroup } from "../../Game/CollisionGroups.ts";

type Props = {
    phase: number,
    target: BaseActor,
    radius: number,
    orbitsPerSecond: number,
    clockwise: boolean,
}

export class OrbitingProjectile extends BaseActor {
    constructor({
        target, radius, orbitsPerSecond, phase, clockwise,
    }: Props) {
        super({
            radius: 20,
            color: Color.Yellow,

            collisionType: CollisionType.Fixed,
            collisionGroup: CollisionGroup.Weapon,
        });

        this.addComponent(new OrbitingComponent({ target, radius, orbitsPerSecond, phase, clockwise }));
    }
}