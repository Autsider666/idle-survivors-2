import { Actor, Entity, GameEvent } from "excalibur";

export interface DamageEvent<T extends Entity = Actor> extends GameEvent<T> {
    source: T;
    amount: number;
}