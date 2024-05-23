import {PreUpdateEvent, Vector} from "excalibur";
import { Direction, DirectionQueue } from "../../Utility/DirectionQueue.ts";
import { BaseActor } from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

export class KeyboardControlledComponent extends BaseMovementComponent {
    private readonly directionQueue = new DirectionQueue();
    
    constructor() {
        super();
        
        this.maxSpeed = 160;
    }
    
    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', ({ engine }: PreUpdateEvent) => {
            this.directionQueue.update(engine);

            this.handleMovement();
        });
    }

    private handleMovement(): void {
        this.owner.vel.x = 0;
        this.owner.vel.y = 0;

        const direction = new Vector(0,0);
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