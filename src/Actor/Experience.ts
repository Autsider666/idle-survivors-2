import {Circle, CircleCollider, CollisionType, Color, Vector} from "excalibur";
import {COLLECTABLE_TAG} from "./Tool/ItemCollector.ts";
import {CollisionGroup} from "../Game/CollisionGroups.ts";
import {ChaseComponent} from "../Component/Movement/ChaseComponent.ts";
import {BaseActor} from "./BaseActor.ts";

type Props = {
    value?: number,
    pos?: Vector,
}

const circle = new Circle({
    radius: 3,
    color: Color.fromRGBString('rgb(93,232,139)'),
    lineWidth: 2,
});

export class Experience extends BaseActor {
    private _value: number;

    constructor({value, pos}: Props = {}) {
        super({
            pos: pos ?? Vector.Zero,
            z: -1,
            collisionGroup: CollisionGroup.Climbable,
            collisionType: CollisionType.Passive,
            collider: new CircleCollider({radius: 3})
        });

        this._value = value ?? 0;

        this.addTag(COLLECTABLE_TAG);

        this.addComponent(new ChaseComponent({speed: 500}));

        this.graphics.use(circle);
    }

    set value(value: number) {
        this._value = value;
    }

    get value(): number {
        return this._value;
    }

    public startCountdown():void {
        this.actions.clearActions();
        this.actions.delay(5000).blink(500, 100, 10).die();
    }
}