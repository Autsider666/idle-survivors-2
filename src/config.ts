import {ProjectileWeapon} from "./Actor/Tool/ProjectileWeapon.ts";
import {BaseActor} from "./Actor/BaseActor.ts";
import {Color} from "excalibur";

export const SPAWN_MAX_MONSTERS:number = 50;
export const SPAWN_RATE:number = 10;
export const SPAWN_DISTANCE:number = 400;

export const MAP_GEN_WAVE_LENGTH:number = 0.5;
export const MAP_GEN_HEIGHT:number = 3000;
export const MAP_GEN_WIDTH:number = 3000;
export const MAP_GEN_USE_ACTORS:boolean = true;

export const XP_MAX_MERGE_RANGE:number = 25;

type WeaponData<W extends BaseActor = BaseActor> = {
    name: string,
    type: new (data: WeaponData<W>) => W,
    minLevel?: number,
    range: number,
    color: Color,
    rateOfFire: number,
    pierce: number,
    damage: number,
}
export const WEAPONS: Record<string, WeaponData> = {
    'main': {
        name: 'Pea shooter',
        type: ProjectileWeapon,
        range: 150,
        color: Color.Red,
        rateOfFire: 3,
        pierce: 0,
        damage: 1,
    },
    'pdc': {
        name: 'Personal Defense Cannon',
        type: ProjectileWeapon,
        minLevel: 2,
        range: 50,
        color: Color.White,
        rateOfFire: 10,
        pierce: 0,
        damage: 1,
    },
    'sniper': {
        name: 'Sniper',
        type: ProjectileWeapon,
        minLevel: 3,
        range: 250,
        color: Color.Blue,
        rateOfFire: 0.5,
        pierce: 5,
        damage: 10,
    },
};
//     2: new Weapon(50, Color.White, 10),
//     3: new OrbitingWeapon({ projectiles: 4, range: 150, rps: 0.6, damage: 1 }),
//     4: new OrbitingWeapon({ projectiles: 10, range: 200, rps: 0.1, clockwise: false }),