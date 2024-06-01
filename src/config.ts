import {BaseActor} from "./Actor/BaseActor.ts";
import {Color} from "excalibur";
import {ProjectileWeapon} from "./Actor/Tool/ProjectileWeapon.ts";

export const SPAWN_MAX_MONSTERS:number = Number.parseInt(import.meta.env.VITE_SPAWN_MAX_MONSTERS);
export const SPAWN_BASE_RATE:number = Number.parseInt(import.meta.env.VITE_SPAWN_BASE_RATE);
export const SPAWN_DISTANCE:number = 400;

export const XP_MAX_MERGE_RANGE:number = 25;

type WeaponData = {
    name: string,
    type: (new (data: WeaponData) => BaseActor),
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
    },
    // 'axe': {
    //     name: 'Axe',
    //     type: MeleeWeapon,
    //     range: 100,
    //     color: Color.Red,
    //     rateOfFire: 1,
    //     damage: 1,
    // },
    // // 'test': {
    // //     name: 'Test',
    // //     type: MeleeWeapon,
    // //     range: 100,
    // //     color: Color.Red,
    // //     rateOfFire: 5,
    // //     damage: 0,
    // //     pushback: true,
    // //     minLevel: 3,
    // // }<MeleeWeapon>,
    'pdc': {
        name: 'Personal Defense Cannon',
        type: ProjectileWeapon,
        minLevel: 2,
        range: 50,
        color: Color.White,
        rateOfFire: 10,
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