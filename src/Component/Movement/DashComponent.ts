import {BaseComponent} from "../BaseComponent.ts";
import {BaseActor} from "../../Actor/BaseActor.ts";
import {KeyboardControlledComponent} from "./KeyboardControlledComponent.ts";
import {CircleCollider, EasingFunctions, Keys} from "excalibur";



export class DashComponent extends BaseComponent {
    private keyBoard?: KeyboardControlledComponent;
    private dashing: boolean = false;
    private remainingCharges: number;

    constructor(
        private readonly maxDistance: number = 150,
        private readonly maxCharges: number = 2,
        private readonly rechargeTime: number = 1000,
        private readonly dashWakeRadius: number = 20,
    ) {
        super();

        this.remainingCharges = this.maxCharges;
    }

    onAdd(owner: BaseActor) {
        this.keyBoard = owner.get(KeyboardControlledComponent);

        this.keyBoard?.onKey(Keys.Space, this.initiateDash.bind(this));

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

        owner?.once<'postupdate'>('postupdate', () => {
            const currentVelocity = owner.vel;
            if (currentVelocity.x === 0 && currentVelocity.y === 0) {
                return;
            }

            this.dashing = true;
            this.remainingCharges--;

            // this.owner.body.collisionType = CollisionType.Fixed;
            const collider = owner.collider.get();
            if (collider instanceof CircleCollider) {
                collider.radius += this.dashWakeRadius;
            }

            const dashVector = currentVelocity.normalize().scaleEqual(this.maxDistance);

            owner.actions.easeBy(dashVector, 300, EasingFunctions.EaseOutCubic).callMethod(this.recover.bind(this));
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