import { BaseActor } from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";
import {TargetComponent} from "../TargetComponent.ts";

type ComponentProps = {
    speed: number,
}

export class ChaseComponent extends BaseMovementComponent {

    constructor({ speed }: ComponentProps) {
        super();

        this.maxSpeed = speed;
    }

    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', () => {
            const target = owner.get(TargetComponent)?.target;
            if (target === undefined) {
                return;
            }

            this.moveInDirection(target.pos.sub(owner.pos));
        });
    }
}