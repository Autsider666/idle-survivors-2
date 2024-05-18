import { Color, ExcaliburGraphicsContext, Vector } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

export class HealthComponent extends BaseComponent {
    public max: number;
    constructor(public amount: number) {
        super();

        this.max = amount;
    }

    onAdd(owner: BaseActor): void {
        owner.on('damage', ({ amount: damage }) => {
            this.amount -= damage;

            // this.owner.emit('health', { amount: this.amount })

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