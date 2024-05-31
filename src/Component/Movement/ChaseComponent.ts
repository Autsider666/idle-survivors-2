import {BaseActor} from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";
import {TargetComponent} from "../TargetComponent.ts";

export class ChaseComponent extends BaseMovementComponent {
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