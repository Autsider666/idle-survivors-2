import {BaseComponent} from "./BaseComponent.ts";
import {BaseActor} from "../Actor/BaseActor.ts";

export class TargetComponent extends BaseComponent {
    constructor(public readonly target: BaseActor) {
        super();
    }

    onAdd(owner: BaseActor) {
        owner.on<'preupdate'>('preupdate', () => {
            if (this.target.isKilled()) {
                owner.removeComponent(TargetComponent);
            }
        });

        owner.on<'kill'>('kill', () => owner.removeComponent(TargetComponent));
    }
}