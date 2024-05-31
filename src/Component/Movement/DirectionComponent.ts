import { Vector } from "excalibur";
import { BaseActor } from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

type FinishedCallback = (target:BaseActor) => void;
type Props = {
    direction: Vector,
    callback?: FinishedCallback
}

export class DirectionComponent extends BaseMovementComponent {
    public direction: Vector;
    private readonly onCollisionCallback?: FinishedCallback;

    constructor({ direction, callback }: Props) {
        super();

        this.direction = direction;
        this.onCollisionCallback = callback;
    }

    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', () =>{
            this.moveInDirection(this.direction);
        });

        owner.on<'collisionstart'>('collisionstart', ({other}) => {
            if (this.onCollisionCallback && other instanceof BaseActor){
                this.onCollisionCallback(other);
            }
        });
    }
}