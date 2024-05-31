import {Vector} from "excalibur";
import {BaseComponent} from "../BaseComponent.ts";
import {Attribute} from "../../Utility/Attribute/AttributeStore.ts";
import {AttributeComponent} from "../AttributeComponent.ts";
import {BaseActor} from "../../Actor/BaseActor.ts";

export abstract class BaseMovementComponent extends BaseComponent {
    private onAddChecked: boolean = false;

    constructor(protected speed: number = 0) {
        super();
    }

    initializeSpeed(owner: BaseActor) {
        this.onAddChecked = true;
        owner.whenComponentExists(AttributeComponent, component => {
            component.onChange(Attribute.Speed, (value: number) => this.speed = value);
        });
    }

    protected moveInDirection(direction: Vector, maxDistance?: number): void {
        if (this.owner === undefined) {
            return;
        }

        if (this.speed === 0 && !this.onAddChecked) {
            this.initializeSpeed(this.owner);
        }

        if (direction.x === 0 && direction.y === 0) {
            this.owner.emit('moving', {direction});
            return;
        }

        let normalizedDirection = direction.normalize();
        this.owner.emit('moving', {direction: normalizedDirection.clone()});
        normalizedDirection = normalizedDirection.scale(Math.min(this.speed, maxDistance ?? this.speed));
        this.owner.vel.x = normalizedDirection.x;
        this.owner.vel.y = normalizedDirection.y;

    }
}