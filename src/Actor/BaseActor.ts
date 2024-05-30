import {Actor, EventEmitter, EventKey, Handler, Subscription, Vector} from "excalibur";
// @ts-expect-error No other way
import {ActorEvents} from "excalibur/build/dist/Actor";
import {DamageEvent} from "../Event/DamageEvent";
import {LevelUpEvent} from "../Event/LevelUpEvent.ts";

type Events = {
    damage: DamageEvent,
    'level-up': LevelUpEvent,
    'moving': {direction:Vector},
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