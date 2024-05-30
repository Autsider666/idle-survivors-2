import {Vector} from "excalibur";
import {BaseComponent} from "../BaseComponent.ts";

export abstract class BaseMovementComponent extends BaseComponent {
    protected constructor(protected readonly maxSpeed: number) {
        super();
    }

    protected moveInDirection(direction: Vector): void {
        if (direction.x === 0 && direction.y === 0) {
            return;
        }

        let normalizedDirection = direction.normalize();
        this.owner.emit('moving', {direction: normalizedDirection.clone()});
        normalizedDirection = normalizedDirection.scale(this.maxSpeed);
        this.owner.vel.x = normalizedDirection.x;
        this.owner.vel.y = normalizedDirection.y;

    }
}