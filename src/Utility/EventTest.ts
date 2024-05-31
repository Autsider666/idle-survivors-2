import {
    Actor as ExActor,
    EventEmitter,
    EventKey,
    InitializeEvent,
    Engine, Handler,
    type EntityEvents,
    CollisionEndEvent, EventMap,
} from "excalibur";
// Not importable through "excalibur", while EntityEvents is, so could possibly be a bug.
// import type {ActorEvents} from "excalibur/build/dist/Actor";

// Imported ActorEvents act wonky in Jetbrains IDEs, probably because of weird input
type ActorEvents = {
    initialize: InitializeEvent,
    collisionend: CollisionEndEvent,
};

// I had a hard time figuring out the correct names for everything, so suggestions are welcome for this type and its variables.
type AppendedEventMap<TOriginal extends EventMap, TExtra extends EventMap | undefined> = TExtra extends EventMap ? TOriginal & TExtra : TOriginal;


// You can also add this to Engine and other classes using EventEmitter
class Entity<
    /** TKnownComponents extends Component = unknown, **/
    TCustomEvents extends EventMap | undefined = undefined,
    // TEvents isn't the nicest way to solve this, but using `AppendedEventMap<EntityEvents, TCustomEvents>`
    // everywhere makes the rest of the code harder to read.
    TEvents extends EventMap = AppendedEventMap<EntityEvents, TCustomEvents>
> /** implements OnInitialize, OnPreUpdate, OnPostUpdate **/ {
    public events = new EventEmitter<TEvents>();

    // No longer 3 different ways to handle events to confuse IDEs
    public on<TEventName extends EventKey<TEvents>>(eventName: TEventName, handler: Handler<TEvents[TEventName]>) {
        this.events.on(eventName, handler);
    }

    public off<TEventName extends EventKey<TEvents>>(eventName: TEventName, handler: Handler<TEvents[TEventName]>) {
        this.events.off(eventName, handler);
    }

    public emit<TEventName extends EventKey<TEvents>>(eventName: TEventName, event: TEvents[TEventName]): void {
        this.events.emit(eventName, event);
    }
}

class Actor<
    TCustomEvents extends EventMap | undefined = undefined,
    TEvents extends EventMap = AppendedEventMap<ActorEvents, TCustomEvents>
> extends Entity<TEvents> /** implements Eventable, PointerEvents, CanInitialize, CanUpdate, CanBeKilled **/ {
    // No need anymore to override this.events anymore
}

// Custom event type
interface DamageTakenEvent {
    amount: number
}

type CustomEvents = {
    "damage-taken": DamageTakenEvent,
    "random-number": number,
}

class Player extends Actor<CustomEvents> {}

// `new Actor<CustomEvents>()` is also valid
const actorWithCustomEvents = new Player();

// Valid custom events
actorWithCustomEvents.on('damage-taken', (event) => console.log('Damage taken!', event));
actorWithCustomEvents.emit('damage-taken', {amount: 1});
actorWithCustomEvents.emit('random-number', Math.random());

// @ts-expect-error Example of invalid code because of missing data
actorWithCustomEvents.on('damage-taken');
// @ts-expect-error Example of invalid code because of invalid data
actorWithCustomEvents.on('damage-taken', 1);


// Valid system event
actorWithCustomEvents.on('initialize', (event: InitializeEvent) => console.log('initialize:', event));
actorWithCustomEvents.emit('initialize', new InitializeEvent(new Engine(), new ExActor()));

// @ts-expect-error Example of invalid System Event code
actorWithCustomEvents.on('collisionend', (event: InitializeEvent) => console.log('initialize:', event));

// This change will also make it easy to hook into the already existing system events because of GameEvent.
// (This is the only not 100% valid code example, because of the Actor/Entity class created for this example)
// @ts-expect-error Example
actorWithCustomEvents.on('collisionend', (event: CollisionEndEvent<Player>) => {
// @ts-expect-error Example
    event.other.emit('damage-taken', (event: DamageTakenEvent) => {
        console.log(event);
    });
});