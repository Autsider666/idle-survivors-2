import {ProjectileWeapon} from "./Actor/Tool/ProjectileWeapon.ts";
import {BaseActor} from "./Actor/BaseActor.ts";
import {Color} from "excalibur";
import {MeleeWeapon} from "./Actor/Tool/MeleeWeapon.ts";

export const SPAWN_MAX_MONSTERS:number = 50;
export const SPAWN_RATE:number = 10;
export const SPAWN_DISTANCE:number = 400;

export const MAP_GEN_WAVE_LENGTH:number = 0.5;
export const MAP_GEN_HEIGHT:number = 5000;
export const MAP_GEN_WIDTH:number = 5000;

export const MAP_ACTOR_EXTRA_DISTANCE_OFFSCREEN:number = 0;

export const XP_MAX_MERGE_RANGE:number = 25;

type WeaponData<W extends BaseActor = BaseActor> = {
    name: string,
    type: W & (new (data: WeaponData<W>) => W),
    minLevel?: number,
    range: number,
    color: Color,
    rateOfFire: number,
    pierce?: number,
    damage: number,
    pushback?:boolean,
    clockwise?: boolean,
}
export const WEAPONS: Record<string, WeaponData> = {
    'main': {
        name: 'Pea shooter',
        type: ProjectileWeapon,
        range: 150,
        color: Color.Red,
        rateOfFire: 3,
        damage: 1,
    }<ProjectileWeapon>,
    'axe': {
        name: 'Axe',
        type: MeleeWeapon,
        range: 100,
        color: Color.Red,
        rateOfFire: 1,
        damage: 1,
    }<MeleeWeapon>,
    // 'test': {
    //     name: 'Test',
    //     type: MeleeWeapon,
    //     range: 100,
    //     color: Color.Red,
    //     rateOfFire: 5,
    //     damage: 0,
    //     pushback: true,
    //     minLevel: 3,
    // }<MeleeWeapon>,
    'pdc': {
        name: 'Personal Defense Cannon',
        type: ProjectileWeapon,
        minLevel: 2,
        range: 50,
        color: Color.White,
        rateOfFire: 10,
        damage: 1,
    }<ProjectileWeapon>,
    'sniper': {
        name: 'Sniper',
        type: ProjectileWeapon,
        minLevel: 3,
        range: 250,
        color: Color.Blue,
        rateOfFire: 0.5,
        pierce: 5,
        damage: 10,
    }<ProjectileWeapon>,
};
//     2: new Weapon(50, Color.White, 10),
//     3: new OrbitingWeapon({ projectiles: 4, range: 150, rps: 0.6, damage: 1 }),
//     4: new OrbitingWeapon({ projectiles: 10, range: 200, rps: 0.1, clockwise: false }),