import {BaseActor} from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";
import {TargetComponent} from "../TargetComponent.ts";

type ComponentProps = {
    speed: number,
}

export class ChaseComponent extends BaseMovementComponent {

    constructor({speed}: ComponentProps) {
        super(speed);
    }

    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', () => {
            const target = owner.get(TargetComponent)?.target;
            if (target === undefined) {
                return;
            }

            const direction = target.pos.sub(owner.pos);

//             const ray = new Ray(owner.pos, direction);
//             const hits = this.owner?.scene?.physics.rayCast(ray, {
//                 searchAllColliders: false,
//                 maxDistance: target.pos.distance(owner.pos),
//                 filter: hit => {
//                     return hit.body.owner instanceof Player || hit.body.owner instanceof Monster;
//                 }
//             }) ?? [];
// console.log(hits);
//             const maxDistance = hits[0]?.distance;

            this.moveInDirection(direction);//, maxDistance ? Math.max(0, maxDistance - 10) : undefined);
        });
    }
}