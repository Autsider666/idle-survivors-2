import {EventEmitter, Keys, PreUpdateEvent, Vector} from "excalibur";
import {Direction, DirectionQueue} from "../../Utility/DirectionQueue.ts";
import {BaseActor} from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

type KeyEventCallback = () => void;
// type LinkedKeyEvents = {
//     [key in Keys]?: string
// }

type KeyEvents = {
    [key in Keys]: KeyEventCallback
}


export class KeyboardControlledComponent extends BaseMovementComponent {
    private readonly directionQueue = new DirectionQueue();

    private readonly events: EventEmitter = new EventEmitter<KeyEvents>();
    private readonly keysToWatch = new Set<Keys>();

    constructor(
        keyEvents?: Map<Keys, KeyEventCallback>,
    ) {
        super();

        keyEvents?.forEach((callback, key) => this.onKey(key, callback));
    }

    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', ({engine}: PreUpdateEvent) => {
            this.directionQueue.update(engine);

            this.handleMovement();

            this.keysToWatch.forEach((key) => {
                if (engine.input.keyboard.wasPressed(key)) {
                    this.events.emit(key);
                }
            });
        });
    }

    onKey(key: Keys, callback: KeyEventCallback): void {
        this.events.on(key, callback);
        this.keysToWatch.add(key);
    }

    private handleMovement(): void {
        if (this.owner === undefined) {
            return;
        }

        this.owner.vel.x = 0;
        this.owner.vel.y = 0;

        const direction = new Vector(0, 0);
        if (this.directionQueue.has(Direction.LEFT)) {
            direction.x = -1;
        }
        if (this.directionQueue.has(Direction.RIGHT)) {
            direction.x = 1;
        }
        if (this.directionQueue.has(Direction.UP)) {
            direction.y = -1;
        }
        if (this.directionQueue.has(Direction.DOWN)) {
            direction.y = 1;
        }

        this.moveInDirection(direction);
    }
}