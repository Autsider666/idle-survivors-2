import {CircleCollider, CollisionType, Color, Label, Vector} from "excalibur";
import {COLLECTABLE_TAG} from "./Tool/ItemCollector.ts";
import {CollisionGroup} from "../Game/CollisionGroups.ts";
import {ChaseComponent} from "../Component/Movement/ChaseComponent.ts";

type Props = {
    value: number,
    pos: Vector,
}

export  class Experience extends Label{
    public readonly value:number;

    constructor({value, pos}:Props) {
        super({
            text: value.toString(),
            pos,
            color: Color.fromRGBString('rgb(80, 200, 120)'),
            collisionGroup: CollisionGroup.Climbable,
            collisionType: CollisionType.Passive,
            collider: new CircleCollider({radius: 5})
        });

        this.value = value;

        this.addTag(COLLECTABLE_TAG);

        this.actions.delay(5000).blink(500,100,10).die();

        this.addComponent(new ChaseComponent({speed: 1000}));
    }
}