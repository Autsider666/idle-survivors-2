import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

export class SlowedComponent extends BaseComponent {
    public counter = 0;

    onAdd(owner: BaseActor): void {
        owner.on('preupdate', () => {
            if (this.counter <= 0) {
                return;
            }
            console.log(this.owner)

            owner.vel = owner.vel.scale(0.5);
        });
    }
}