import {Vector} from "excalibur";
import {BaseComponent} from "../BaseComponent.ts";

export abstract class BaseMovementComponent extends BaseComponent {
    protected constructor(protected readonly maxSpeed:number) {
        super();
    }

    protected moveInDirection(direction: Vector): void {
        if (direction.x === 0 && direction.y === 0) {
            return;
        }

        const normalizedDirection = direction.normalize().scale(this.maxSpeed);
        this.owner.vel.x = normalizedDirection.x;
        this.owner.vel.y = normalizedDirection.y;
    }
}