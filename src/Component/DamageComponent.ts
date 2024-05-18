import { Actor, PreCollisionEvent } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

type ComponentProps = {
    amount: number,
    killAfterHits?: number,
    targetTag?: string,
}

export class DamageComponent extends BaseComponent {
    public amount: number;
    public killAfterHits?: number;
    public targetTag?: string;

    constructor(
        {
            amount,
            killAfterHits,
            targetTag,
        }: ComponentProps
    ) {
        super();

        this.amount = amount;
        this.killAfterHits = killAfterHits;
        this.targetTag = targetTag;
    }

    onAdd(owner: Actor): void {
        owner.on('precollision', this.onPreCollision.bind(this));
    }

    onPreCollision({ other }: PreCollisionEvent): void {
        if (!(other instanceof BaseActor)) {
            return;
        }

        if (this.targetTag && !other.hasTag(this.targetTag)) {
            return;
        }

        if (other.isKilled()) {
            return;
        }

        other.emit('damage', { amount: this.amount });

        if (this.killAfterHits !== undefined && --this.killAfterHits === 0) {
            this.owner.kill();
        }
    }
}