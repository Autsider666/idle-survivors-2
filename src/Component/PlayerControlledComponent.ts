import { PreUpdateEvent } from "excalibur";
import { Direction, DirectionQueue } from "../Utility/DirectionQueue";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

export class PlayerControlledComponent extends BaseComponent {
    private readonly directionQueue = new DirectionQueue();
    private speed: number = 160;

    onAdd(owner: BaseActor): void {
        owner.on('preupdate', ({ engine }: PreUpdateEvent) => {
            this.directionQueue.update(engine);

            this.handleMovement();
        })
    }

    private handleMovement(): void {
        const velosity = this.owner.vel;

        velosity.x = 0;
        velosity.y = 0;
        if (this.directionQueue.has(Direction.LEFT)) {
            velosity.x = -1;
        }
        if (this.directionQueue.has(Direction.RIGHT)) {
            velosity.x = 1;
        }
        if (this.directionQueue.has(Direction.UP)) {
            velosity.y = -1;
        }
        if (this.directionQueue.has(Direction.DOWN)) {
            velosity.y = 1;
        }

        // Normalize walking speed
        if (this.owner.vel.x !== 0 || this.owner.vel.y !== 0) {
            const normalizedVelosity = this.owner.vel.normalize();
            velosity.x = normalizedVelosity.x * this.speed;
            velosity.y = normalizedVelosity.y * this.speed;
        }
    }
}