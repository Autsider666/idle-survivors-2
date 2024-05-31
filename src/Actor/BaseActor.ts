import {
    Actor,
    Component,
    ComponentCtor,
    DegreeOfFreedom,
    EventEmitter,
    EventKey,
    Handler,
    Subscription,
    Vector
} from "excalibur";
// @ts-expect-error No other way
import {ActorArgs, ActorEvents} from "excalibur/build/dist/Actor";
import {DamageEvent} from "../Event/DamageEvent";
import {LevelUpEvent} from "../Event/LevelUpEvent.ts";

type Events = {
    damage: DamageEvent,
    'level-up': LevelUpEvent,
    'moving': {direction:Vector},
} & ActorEvents

export class BaseActor extends Actor {
    events = new EventEmitter<Events>();

    constructor(props?:ActorArgs) {
        super({
            ...props,
        });

        this.body.limitDegreeOfFreedom.push(DegreeOfFreedom.Rotation);
        this.body.friction = 0;
        this.body.useGravity = false;
        this.body.bounciness = 0;
    }

    on<TEventName extends EventKey<Events>>(eventName: TEventName, handler: Handler<Events[TEventName]>): Subscription {
        return super.on(eventName as EventKey<ActorEvents>, handler as Handler<ActorEvents[EventKey<ActorEvents>]>);
    }

    emit<TEventName extends EventKey<Events>>(eventName: TEventName, event: Events[TEventName]): void {
        super.emit(eventName, event);
    }

    whenComponentExists<TComponent extends Component>(component: ComponentCtor<TComponent>, callback: (component: TComponent) => void) {
        const handleComponentCheck = () => {
            const newComponent = this.get(component) as TComponent | undefined;
            if (newComponent === undefined) {
                return;
            }
            console.log(component, callback,newComponent);

            callback(newComponent);

            this.off('postupdate', handleComponentCheck);
        };

        this.on('postupdate', handleComponentCheck);
    }
}