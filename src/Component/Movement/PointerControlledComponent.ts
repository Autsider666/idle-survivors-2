import {BaseActor} from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

enum TrackState {
    Idle, // No mouse down and on mouse up
    Active, // Mouse down in canvas
    Waiting, // When active mouse leaves canvas and is not released
}

export class PointerControlledComponent extends BaseMovementComponent {
    private state: TrackState = TrackState.Idle;

    constructor() {
        super();
    }

    onAdd(owner: BaseActor): void {
        owner.on<'initialize'>('initialize', this.initialize.bind(this));
    }

    private initialize(): void {
        const owner = this.owner;
        if (owner === undefined) {
            throw new Error('Can\'t initialize without an owner.');
        }

        const engine = owner.scene?.engine;
        if (engine === undefined) {
            throw new Error('Why no engine?');
        }
        const pointer = engine.input.pointers.primary;

        pointer.on<'down'>('down', () => {
            this.state = TrackState.Active;
        });

        pointer.on<'up'>('up', () => {
            this.state = TrackState.Idle;
        });

        document.addEventListener('mouseup', () => {
            this.state = TrackState.Idle;
        });

        engine.canvas.onmouseout = () => {
            if (this.state === TrackState.Active) {
                this.state = TrackState.Waiting;
            }
        };

        engine.canvas.onmouseover = ({buttons}) => {
            if (this.state === TrackState.Waiting && buttons === 1) {
                this.state = TrackState.Active;
            }
        };

        owner.on<'preupdate'>('preupdate', () => {
            if (this.state !== TrackState.Active) {
                return;
            }

            this.moveInDirection(engine.screen.screenToWorldCoordinates(pointer.lastScreenPos).sub(owner.pos));
        });
    }
}