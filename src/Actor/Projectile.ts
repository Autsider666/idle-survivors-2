import { CollisionType, Color } from "excalibur";
import { DamageComponent } from "../Component/DamageComponent";
import { BaseActor } from "./BaseActor";
import { DestinationComponent } from "../Component/DestinationComponent";
import { SCALE_2x } from "../Game/Constant";
import { CollisionGroup } from "../Game/CollisionGroups";

export type ProjectileProperties = {
    color: Color,
    damage: number,
    radius?: number,
    destroyAfterHits?: number,
}

export class Projectile extends BaseActor {
    // private msRemaining: number = 2000;
    private velosity: number = 300;

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
            velosity: this.velosity,
            callback: () => this.kill(),
        }));
    }
}