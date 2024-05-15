import { Actor, Circle, CollisionType, Color, Engine, Timer } from "excalibur";
import { Projectile } from "./Projectile";
import { PlayerCollisionGroup } from "./Player";

export class Weapon extends Actor {
    private readonly targets = new Set<Actor>();
    private nextShot: number = 0;

    constructor(
        range: number = 150,
        private readonly projectileColor: Color = Color.White,
        private readonly rateOfFire: number = 2
    ) {
        super({
            radius: range,
            opacity: 0.6,
            z: -1,
            collisionType: CollisionType.Passive,
            collisionGroup: PlayerCollisionGroup,
        });

        this.graphics.add(new Circle({
            radius: range,
            color: Color.Transparent,
            lineWidth: 1,
            strokeColor: Color.Black,
            lineDash: [25],
            padding: 5 // optional, might need to give padding to avoid being cut off
        }));

        this.on("collisionstart", ({ other: target }) => {
            this.targets.add(target);
        });

        this.on("collisionend", ({ other: target }) => {
            this.targets.delete(target);
        });
    }

    onPreUpdate(engine: Engine<any>, delta: number): void {
        if (this.targets.size === 0 || this.nextShot > 0) {
            this.nextShot -= delta;

            return;
        }

        this.fireProjectile();
    }

    private fireProjectile(): void {
        const target = this.targets.values().next().value as Actor | undefined;
        if (target === undefined) {
            return;
        }

        const projectile = new Projectile(this, target, this.projectileColor);
        this.scene?.add(projectile);

        this.nextShot = 1000.0 / this.rateOfFire;
    }
}