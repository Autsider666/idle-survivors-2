import {Vector} from "excalibur";
import {BaseComponent} from "../BaseComponent.ts";
import {AttributeWatcher} from "../../Utility/AttributeWatcher.ts";
import {Attribute} from "../../Utility/AttributeStore.ts";

export abstract class BaseMovementComponent extends BaseComponent {
    protected speed: number;

    protected constructor(
        speed: AttributeWatcher<Attribute.Speed> | number
    ) {
        super();

        if (speed instanceof AttributeWatcher) {
            this.speed = speed.value;
            speed.onChange((value: number) => {
                this.speed = value;
            });
        } else {
            this.speed = speed;
        }
    }

    protected moveInDirection(direction: Vector, maxDistance?: number): void {
        if (this.owner === undefined || direction.x === 0 && direction.y === 0) {
            return;
        }

        let normalizedDirection = direction.normalize();
        this.owner.emit('moving', {direction: normalizedDirection.clone()});
        normalizedDirection = normalizedDirection.scaleEqual(Math.min(this.speed, maxDistance ?? this.speed));
        this.owner.vel.x = normalizedDirection.x;
        this.owner.vel.y = normalizedDirection.y;

    }
}