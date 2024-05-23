import { Vector } from "excalibur";
import { BaseActor } from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

type FinishedCallback = (target:BaseActor) => void;
type Props = {
    direction: Vector,
    velocity: number,
    callback?: FinishedCallback
}

export class DirectionComponent extends BaseMovementComponent {
    public direction: Vector;
    private readonly callback?: FinishedCallback;

    constructor({ direction, velocity, callback }: Props) {
        super();

        this.direction = direction;

        this.maxSpeed = velocity;
        this.callback = callback;
    }

    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', () =>{
            this.moveInDirection(this.direction);
        });

        owner.on<'collisionstart'>('collisionstart', ({other}) => {
            if (this.callback && other instanceof BaseActor){
                this.callback(other);
            }
        });
    }
}