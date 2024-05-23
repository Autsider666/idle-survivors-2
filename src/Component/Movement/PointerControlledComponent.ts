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

        this.maxSpeed = 160;
    }

    onAdd(owner: BaseActor): void {
        owner.on<'initialize'>('initialize', this.initialize.bind(this));
    }

    private initialize(): void {
        const engine = this.owner.scene?.engine;
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
            console.log(1)
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

        this.owner.on<'preupdate'>('preupdate', () => {
            if (this.state !== TrackState.Active) {
                return;
            }

            this.moveInDirection(engine.screen.screenToWorldCoordinates(pointer.lastScreenPos).sub(this.owner.pos));
        })
    }
}