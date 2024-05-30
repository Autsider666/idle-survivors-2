import {BaseActor} from "../BaseActor.ts";
import {CollisionType, Color, Vector} from "excalibur";
import {CollisionGroup} from "../../Game/CollisionGroups.ts";
import {DamageComponent} from "../../Component/DamageComponent.ts";

type Props = {
    name: string,
    range: number,
    color: Color,
    damage: number,
    rateOfFire: number,
    pushback?: boolean,
    clockwise?: boolean,
    // speed?: number,
    // phase?: number,
    // lifetime?: number,
}

export class MeleeWeapon extends BaseActor {
    // private readonly range: number;
    // private readonly damage: number;
    // private readonly color: Color;
    // private readonly rateOfFire: number;
    // private readonly clockwise: boolean;
    // private readonly speed: number;
    // private readonly phase: number;
    // private readonly maxLifetime: number;
    // private lifetime: number;

    constructor({name, damage,range, color, rateOfFire, pushback, clockwise,/*  lifetime, phase, speed */}: Props) {
        super({
            name,
            height: range,
            width: 10,
            anchor: new Vector(0.5, 1),
            // radius: range,
            opacity: 0.6,
            color: color,
            z: -1,
            collisionType: pushback ? CollisionType.Fixed : CollisionType.Passive,
            collisionGroup: CollisionGroup.Weapon,
            angularVelocity: Math.PI * 2 * rateOfFire * (clockwise === false ? -1 : 1),
        });

        // this.range = range;
        // this.damage = damage;
        // this.color = color;
        // this.rateOfFire = rateOfFire;
        // this.clockwise = clockwise ?? true;
        // this.speed = speed ?? 100;
        // this.phase = phase ?? 0;
        // this.maxLifetime = lifetime ?? 1000;
        // this.lifetime = this.maxLifetime;

        this.addComponent(new DamageComponent({damage, killAfterHits: -1}));
    }
}