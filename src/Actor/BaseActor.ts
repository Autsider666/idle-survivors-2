import { Actor, EventEmitter, EventKey, Handler, Subscription } from "excalibur";
import { ActorEvents } from "excalibur/build/dist/Actor";
import { DamageEvent } from "../Event/DamageEvent";

type Events = {
    damage: DamageEvent
} & ActorEvents

export class BaseActor extends Actor {
    events = new EventEmitter<Events>();

    on<TEventName extends EventKey<Events>>(eventName: TEventName, handler: Handler<Events[TEventName]>): Subscription {
        return this.on(eventName, handler);
    }

    emit<TEventName extends EventKey<Events>>(eventName: TEventName, event: Events[TEventName]): void {
        this.emit(eventName, event);
    }
}