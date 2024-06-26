import { Vector } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

type FinishedCallback = () => void;
type Props = {
    destination: Vector | BaseActor,
    velocity: number,
    callback?: FinishedCallback
}

export class DestinationComponent extends BaseComponent {
    private destination: Vector;
    private velocity: number;
    private callback?: FinishedCallback;

    constructor({ destination, velocity, callback }: Props) {
        super();

        if (destination instanceof BaseActor) {
            this.destination = destination.getGlobalPos().clone();
        } else {
            this.destination = destination;
        }

        this.velocity = velocity;
        this.callback = callback;
    }

    onAdd(owner: BaseActor): void {
        owner.actions.moveTo(this.destination, this.velocity).callMethod(() => {
            if (this.callback) {
                this.callback();
            }
        });
    }
}