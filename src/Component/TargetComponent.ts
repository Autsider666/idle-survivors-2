import {BaseComponent} from "./BaseComponent.ts";
import {BaseActor} from "../Actor/BaseActor.ts";
import {Entity} from "excalibur";

export class TargetComponent extends BaseComponent {
    public readonly target: BaseActor;
    constructor({target}:{target:Entity}) {
        super();

        if (!(target instanceof BaseActor)) {
            throw new Error('Not a BaseActor, should fix this probably'); // TODO better fix needed
        }

        this.target = target;
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