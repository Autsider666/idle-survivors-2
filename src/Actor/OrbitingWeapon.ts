import { DamageComponent } from "../Component/DamageComponent";
import { BaseActor } from "./BaseActor";
import { OrbitingProjectile } from "./OrbitingProjectile";

type Props = {
    range: number,
    projectiles: number,
    rps: number,
    clockwise?: boolean,
    damage?: number,
}

export class OrbitingWeapon extends BaseActor {
    constructor({
        projectiles, range, rps, clockwise, damage
    }: Props) {
        super();

        for (let i = 0; i < projectiles; i++) {
            const orbiter = new OrbitingProjectile({
                target: this,
                radius: range,
                orbitsPerSecond: rps,
                phase: i * (1.0 / projectiles),
                clockwise: clockwise ?? true,
            });

            if (damage) {
                orbiter.addComponent(new DamageComponent({ damage }));
            }

            this.addChild(orbiter);

        }
    }
}