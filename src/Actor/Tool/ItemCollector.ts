import {BaseActor} from "../BaseActor.ts";
import {Circle, CollisionStartEvent, CollisionType, Color, } from "excalibur";
import {CollisionGroup} from "../../Game/CollisionGroups.ts";
import {TargetComponent} from "../../Component/TargetComponent.ts";

export const COLLECTABLE_TAG = 'COLLECTABLE_TAG';

export class ItemCollector extends BaseActor {
    constructor(range: number) {
        super({
            radius: range,
            opacity: 0.6,
            z: -1,
            collisionType: CollisionType.Passive,
            collisionGroup: CollisionGroup.Collector,
        });

        this.graphics.add(new Circle({
            radius: range,
            color: Color.Transparent,
            lineWidth: 1,
            strokeColor: Color.White,
            lineDash: [5],
            padding: 5 // optional, might need to give padding to avoid being cut off
        }));

        this.on<'collisionstart'>('collisionstart',this.onCollision.bind(this));
    }

    private onCollision({other}:CollisionStartEvent):void {
        if (!other.hasTag(COLLECTABLE_TAG)) {
            return;
        }

        if (this.parent instanceof BaseActor) {
            other.addComponent(new TargetComponent(this.parent));
        }
    }
}