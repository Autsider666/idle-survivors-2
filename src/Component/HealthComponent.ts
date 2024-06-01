import {Color, ExcaliburGraphicsContext, Vector} from "excalibur";
import {BaseComponent} from "./BaseComponent";
import {BaseActor} from "../Actor/BaseActor";
import {AttributeComponent} from "./AttributeComponent.ts";
import {Attribute} from "../Utility/Attribute/AttributeStore.ts";

export class HealthComponent extends BaseComponent {
    public max: number = 0;
    public amount: number = 0;

    onAdd(owner: BaseActor): void {
        owner.whenComponentExists(AttributeComponent, (attributes) => {
            attributes.onChange(Attribute.Health, value => {
                this.max = value;
                this.amount = Math.min(this.amount, value);
            });

            this.amount = this.max;
        });

        owner.on('damage', ({amount: damage}) => {
            this.amount -= damage;

            // this.owner.emit('health', { amount: this.amount })

            if (this.amount <= 0) {
                owner.kill();
            }
        });

        if (this.max > 1) {
            owner.graphics.onPostDraw = (gfx: ExcaliburGraphicsContext) => {
                gfx.drawRectangle(new Vector(-5, -2), 10, 4, Color.Green);
            };
        }
    }
}