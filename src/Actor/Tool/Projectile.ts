import {CollisionType, Color, Vector} from "excalibur";
import {DamageComponent} from "../../Component/DamageComponent.ts";
import {BaseActor} from "../BaseActor.ts";
import {SCALE_2x} from "../../Game/Constant.ts";
import {CollisionGroup} from "../../Game/CollisionGroups.ts";
import {DirectionComponent} from "../../Component/Movement/DirectionComponent.ts";
import {Attribute} from "../../Utility/Attribute/AttributeStore.ts";
import {AttributeComponent} from "../../Component/AttributeComponent.ts";

export type ProjectileProperties = {
    color: Color,
    damage: number,
    speed: number,
    radius?: number,
    pierce?: number,
    maxLifetime?: number,
    friendlyFire?: boolean,
}

export class Projectile extends BaseActor {
    public pierce: number;
    public readonly maxLifetime: number;
    private lifetime: number;
    public friendlyFire: boolean;

    constructor(
        private readonly origin: BaseActor,
        projectile: ProjectileProperties
    ) {
        super({
            pos: Vector.Zero,
            scale: SCALE_2x,
            radius: projectile.radius ?? 2,
            color: projectile.color,

            collisionType: CollisionType.Passive,
            collisionGroup: CollisionGroup.Weapon,
        });

        this.pierce = projectile.pierce ?? 0;
        this.friendlyFire = projectile.friendlyFire ?? false;

        // const distance = origin.getGlobalPos().distance(target.pos);

        // this.maxLifetime = projectile.maxLifetime ?? distance / this.speed * 1000;
        this.maxLifetime = projectile.maxLifetime ?? 1000;
        if (projectile.maxLifetime === undefined && this.pierce >= 1) {
            this.maxLifetime *= this.pierce;
        }

        this.lifetime = this.maxLifetime;

        this.on<'postupdate'>('postupdate', ({delta}) => {
            this.lifetime -= delta;
            if (this.lifetime <= 0) {
                this.kill();
            }
        });

        this.addComponent(new AttributeComponent({[Attribute.Speed]: projectile.speed}));
        this.addComponent(new DamageComponent(projectile));
        this.addComponent(new DirectionComponent({
            // direction: target.pos.sub(origin.getGlobalPos()),
            direction: Vector.Zero,
            callback: (other) => {
                if (this.friendlyFire && other === this) {
                    return;
                }

                if (--this.pierce <= 0) {
                    this.kill();
                }
            },
        }));
    }

    public setTarget(target: BaseActor): void {
        this.get(DirectionComponent).direction = target.pos.sub(this.origin.globalPos);
        this.pos = this.origin.globalPos.clone();
        this.lifetime = this.maxLifetime;
    }
}