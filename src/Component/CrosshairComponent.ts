import {BaseComponent} from "./BaseComponent.ts";
import {Crosshair} from "../Actor/Crosshair.ts";
import {BaseActor} from "../Actor/BaseActor.ts";
import {AttributeComponent} from "./AttributeComponent.ts";
import {Attribute} from "../Utility/Attribute/AttributeStore.ts";

export class CrosshairComponent extends BaseComponent {
    public readonly actor: Crosshair;
    private synched: boolean = false;

    constructor() {
        super();

        this.actor = new Crosshair();
    }

    onAdd(owner: BaseActor) {
        if (owner.has(AttributeComponent)) {
            this.syncCrosshairSpeed();
        } else {
            owner.on('postupdate', this.syncCrosshairSpeed.bind(this));
        }
    }

    private syncCrosshairSpeed(): void {
        if (this.synched) {
            console.log(1);
            this.owner?.off('postupdate', this.syncCrosshairSpeed);
            return;
        }

        const attributes = this.owner?.get(AttributeComponent);

        if (attributes === undefined) {
            return;
        }

        this.actor.speed = attributes.get(Attribute.Speed);

        attributes.onChange(Attribute.Speed, value => {
            this.actor.speed = value;
        });

        this.owner?.addChild(this.actor);

        this.synched = true;
    }
}