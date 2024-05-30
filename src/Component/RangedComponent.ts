import { Actor, Circle, Color, PreUpdateEvent } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { Projectile } from "../Actor/Tool/Projectile.ts";
import { BaseActor } from "../Actor/BaseActor";
import {ActorPool} from "../Utility/ActorPool.ts";

type Props = {
    range: number,
    color: Color,
    rateOfFire: number,
    pierce: number,
    lifetime?: number,
    speed?: number,
}

const pools = new Map<string, ActorPool<Projectile>>();

export class RangedComponent extends BaseComponent {
    private readonly range: number;
    private readonly targets = new Set<Actor>();
    private readonly color: Color;
    private readonly rateOfFire: number;
    private readonly pierce: number;
    private nextShot: number = 0;
    private readonly lifetime?:number;
    private readonly speed:number;

    constructor(
        {
            range,
            color,
            rateOfFire,
            pierce,
            lifetime,
            speed,
        }: Props
    ) {
        super();

        this.range = range;
        this.color = color;
        this.rateOfFire = rateOfFire;
        this.pierce = pierce;
        this.speed = speed ?? 300;

        if (lifetime === undefined) {
            this.lifetime = 1000 * this.range / this.speed;
        }
    }

    onAdd(owner: Actor): void {
        owner.graphics.add(new Circle({
            radius: this.range,
            color: Color.Transparent,
            lineWidth: 1,
            strokeColor: this.color,
            lineDash: [25],
            padding: 5 // optional, might need to give padding to avoid being cut off
        }));

        owner.on<'collisionstart'>("collisionstart", ({ other: target }) => {
            this.targets.add(target);
        });

        owner.on<'collisionend'>("collisionend", ({ other: target }) => {
            this.targets.delete(target);
        });

        owner.on<'preupdate'>("preupdate", ({ delta }: PreUpdateEvent) => {
            if (this.targets.size === 0 || this.nextShot > 0) {
                this.nextShot -= delta;

                return;
            }

            this.fireProjectile();
        });
    }

    private fireProjectile(): void {
        const owner = this.owner;
        if (owner === undefined) {
            return;
        }

        let closestTarget: Actor|undefined;
        let closestDistance = Infinity;
        for (const potentialTarget of this.targets.values()) {
            const distance = owner.getGlobalPos().distance(potentialTarget.pos);
            if (distance >= closestDistance) {
                continue;
            }

            closestTarget = potentialTarget;
            closestDistance = distance;
        }

        if (!(closestTarget instanceof BaseActor)) {
            return;
        }

        let pool = pools.get(owner.name);
        if (pool === undefined) {
            pool = new ActorPool<Projectile>(() => new Projectile(owner,{ color: this.color, damage: 1, pierce: this.pierce, maxLifetime: this.lifetime,speed: this.speed }));
            pools.set(owner.name, pool);
        }

        const projectile = pool.requestActor();
        projectile.setTarget(closestTarget);

        owner.scene?.add(projectile);

        this.nextShot = 1000.0 / this.rateOfFire;
    }
}