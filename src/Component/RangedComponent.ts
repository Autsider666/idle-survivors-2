import { Actor, Circle, Color, PreUpdateEvent } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { Projectile } from "../Actor/Projectile";
import { BaseActor } from "../Actor/BaseActor";

type ComponentProps = {
    range: number,
    projectileColor: Color,
    rateOfFire: number,
}

export class RangedComponent extends BaseComponent {
    private readonly range: number;
    private readonly targets = new Set<Actor>();
    private readonly projectileColor: Color;
    private readonly rateOfFire: number;
    private nextShot: number = 0;

    constructor(
        {
            range,
            projectileColor,
            rateOfFire,
        }: ComponentProps
    ) {
        super();

        this.range = range;
        this.projectileColor = projectileColor;
        this.rateOfFire = rateOfFire;
    }

    onAdd(owner: Actor): void {
        owner.graphics.add(new Circle({
            radius: this.range,
            color: Color.Transparent,
            lineWidth: 1,
            strokeColor: this.projectileColor,
            lineDash: [25],
            padding: 5 // optional, might need to give padding to avoid being cut off
        }));

        owner.on("collisionstart", ({ other: target }) => {
            this.targets.add(target);
        });

        owner.on("collisionend", ({ other: target }) => {
            this.targets.delete(target);
        });

        owner.on("preupdate", ({ delta }: PreUpdateEvent) => {
            if (this.targets.size === 0 || this.nextShot > 0) {
                this.nextShot -= delta;

                return;
            }

            this.fireProjectile();
        });
    }

    private fireProjectile(): void {
        const target = this.targets.values().next().value;
        if (!(target instanceof BaseActor)) {
            return;
        }

        const projectile = new Projectile(this.owner, target, { color: this.projectileColor, damage: 1 });
        this.owner.scene?.add(projectile);

        this.nextShot = 1000.0 / this.rateOfFire;
    }
}