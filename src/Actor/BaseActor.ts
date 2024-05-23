import { Actor, EventEmitter, EventKey, Handler, Subscription } from "excalibur";
import { ActorEvents } from "excalibur/build/dist/Actor";
import { DamageEvent } from "../Event/DamageEvent";
import {LevelUpEvent} from "../Event/LevelUpEvent.ts";

type Events = {
    damage: DamageEvent,
    'level-up': LevelUpEvent,
} & ActorEvents

export class BaseActor extends Actor {
    events = new EventEmitter<Events>();

    on<TEventName extends EventKey<Events>>(eventName: TEventName, handler: Handler<Events[TEventName]>): Subscription {
        return super.on(eventName as EventKey<ActorEvents>, handler as Handler<ActorEvents[EventKey<ActorEvents>]>);
    }

    emit<TEventName extends EventKey<Events>>(eventName: TEventName, event: Events[TEventName]): void {
        super.emit(eventName, event);
    }
}