import {BaseComponent} from "../BaseComponent.ts";
import {BaseActor} from "../../Actor/BaseActor.ts";
import {KeyboardControlledComponent} from "./KeyboardControlledComponent.ts";
import {CircleCollider, EasingFunctions, Keys} from "excalibur";
import {CrosshairComponent} from "../CrosshairComponent.ts";
import {AttributeComponent} from "../AttributeComponent.ts";
import {Attribute} from "../../Utility/Attribute/AttributeStore.ts";


export class DashComponent extends BaseComponent {
    private target?: BaseActor;
    private keyBoard?: KeyboardControlledComponent;
    private dashing: boolean = false;
    private remainingCharges: number = 0;
    private maxCharges: number = 0;

    constructor(
        private readonly rechargeTime: number = 1000,
        private readonly dashWakeRadius: number = 20,
    ) {
        super();
    }

    onAdd(owner: BaseActor) {
        this.keyBoard = owner.get(KeyboardControlledComponent);

        this.keyBoard?.onKey(Keys.Space, this.initiateDash.bind(this));

        owner.whenComponentExists(CrosshairComponent,component => {
            this.target = component.actor;
        });

        owner.whenComponentExists(AttributeComponent,component => {
            component.onChange(Attribute.Dashes, value => {
                this.maxCharges = value;
                this.remainingCharges = Math.min(value, this.remainingCharges);
            });
        });

        owner.on('postupdate', ({delta}) => {
            if (!this.dashing && this.remainingCharges < this.maxCharges) {
                this.remainingCharges = Math.min(
                    this.remainingCharges + (1 / this.rechargeTime) * delta,
                    this.maxCharges);
            }
        });
    }

    initiateDash(): void {
        if (!this.dashing && this.remainingCharges < 1) {
            return;
        }

        const owner = this.owner;
        if (owner === undefined) {
            return;
        }

        owner.once<'postupdate'>('postupdate', () => {
            if (owner.vel.x === 0 && owner.vel.y === 0) {
                return;
            }

            this.dashing = true;
            this.remainingCharges--;

            if (this.target === undefined) {
                return;
            }

            owner.actions.easeTo(this.target.globalPos, 300, EasingFunctions.EaseOutCubic).callMethod(this.recover.bind(this));
        });
    }

    recover(): void {
        this.dashing = false;

        const collider = this.owner?.collider.get();
        if (collider instanceof CircleCollider) {
            collider.radius -= this.dashWakeRadius;
        }
    }
}