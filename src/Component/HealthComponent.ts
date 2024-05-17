import { Actor, Color, Entity, ExcaliburGraphicsContext, Vector } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { DamageEvent } from "../Event/DamageEvent";

export class HealthComponent extends BaseComponent {
    public max: number;
    constructor(public amount: number) {
        super();

        this.max = amount;
    }

    onAdd(owner: Actor): void {
        owner.on('damage', ({ amount: damage }: DamageEvent) => {
            this.amount -= damage;

            this.owner.emit('health', { amount: this.amount })

            if (this.amount <= 0) {
                owner.kill();
            }
        });

        if (this.max > 1) {
            owner.graphics.onPostDraw = (gfx: ExcaliburGraphicsContext) => {
                gfx.drawRectangle(new Vector(-5, -2), 10, 4, Color.Green);
            }
        }
    }
}