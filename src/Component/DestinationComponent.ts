import { Vector } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

type FinishedCallback = () => void;
type Props = {
    destination: Vector | BaseActor,
    velosity: number,
    callback?: FinishedCallback
}

export class DestinationComponent extends BaseComponent {
    private destination: Vector;
    private velosity: number;
    private callback?: FinishedCallback;

    constructor({ destination, velosity, callback }: Props) {
        super();

        if (destination instanceof BaseActor) {
            this.destination = destination.getGlobalPos().clone();
        } else {
            this.destination = destination;
        }

        this.velosity = velosity;
        this.callback = callback;
    }

    onAdd(owner: BaseActor): void {
        owner.actions.moveTo(this.destination, this.velosity).callMethod(() => {
            if (this.callback) {
                this.callback();
            }
        });
    }
}