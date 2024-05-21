import { CollisionType, Color } from "excalibur";
import { DamageComponent } from "../../Component/DamageComponent.ts";
import { BaseActor } from "../BaseActor.ts";
import { DestinationComponent } from "../../Component/DestinationComponent.ts";
import { SCALE_2x } from "../../Game/Constant.ts";
import { CollisionGroup } from "../../Game/CollisionGroups.ts";

export type ProjectileProperties = {
    color: Color,
    damage: number,
    radius?: number,
    destroyAfterHits?: number,
}

export class Projectile extends BaseActor {
    // private msRemaining: number = 2000;
    private velocity: number = 300;

    constructor(origin: BaseActor, target: BaseActor, projectile: ProjectileProperties) {
        super({
            pos: origin.getGlobalPos().clone(),
            scale: SCALE_2x,
            radius: projectile.radius ?? 2,
            color: projectile.color,

            collisionType: CollisionType.Passive,
            collisionGroup: CollisionGroup.Weapon,
        });

        this.addComponent(new DamageComponent(projectile));
        this.addComponent(new DestinationComponent({
            destination: target,
            velocity: this.velocity,
            callback: () => this.kill(),
        }));
    }
}