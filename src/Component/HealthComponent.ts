import {Color, ExcaliburGraphicsContext, Vector} from "excalibur";
import {BaseComponent} from "./BaseComponent";
import {BaseActor} from "../Actor/BaseActor";
import {AttributeComponent} from "./AttributeComponent.ts";
import {Attribute} from "../Utility/Attribute/AttributeStore.ts";

export class HealthComponent extends BaseComponent {
    public amount: number;

    constructor(
        public maxAmount: number = 0,
        private readonly onKill: (owner:BaseActor)=> void = owner => owner.kill(),
    ) {
        super();

        this.amount = maxAmount;
    }

    onAdd(owner: BaseActor): void {
        owner.whenComponentExists(AttributeComponent, (attributes) => {
            attributes.onChange(Attribute.Health, value => {
                this.maxAmount = value;
                this.amount = Math.min(this.amount, value);
            });

            this.amount = this.maxAmount;
        });

        owner.on('damage', ({amount: damage}) => {
            this.amount -= damage;

            // this.owner.emit('health', { amount: this.amount })

            if (this.amount <= 0) {
                this.onKill(owner);
            }
        });

        if (this.maxAmount > 1) {
            owner.graphics.onPostDraw = (gfx: ExcaliburGraphicsContext) => {
                gfx.drawRectangle(new Vector(-5, -2), 10, 4, Color.Green);
            };
        }
    }
}