import {BaseComponent} from "../BaseComponent.ts";
import {BaseActor} from "../../Actor/BaseActor.ts";
import {KeyboardControlledComponent} from "./KeyboardControlledComponent.ts";
import {Circle, CircleCollider, Color, EasingFunctions, Font, Keys, Label, Vector} from "excalibur";

const landingAreaData = {
    radius: 10,
    opacity: 0.5,
    color: Color.Red,
};

const landingAreaGraphic = new Circle({
    radius: landingAreaData.radius,
    color: Color.Transparent,
    strokeColor: landingAreaData.color,
    lineWidth: 3,
    lineDash: [5],
});

const generateLabelText = (charges: number): string => {
    let text = '';
    for (let i = 0; i < Math.floor(charges); i++) {
        text += '.';
    }

    return text;
};

export class DashComponent extends BaseComponent {
    private keyBoard?: KeyboardControlledComponent;
    private dashing: boolean = false;
    private remainingCharges: number;
    private readonly landingArea: BaseActor;
    private readonly label: Label;

    constructor(
        private readonly maxDistance: number = 150,
        private readonly maxCharges: number = 2,
        private readonly rechargeTime: number = 1000,
        private readonly dashWakeRadius: number = 20,
    ) {
        super();

        this.remainingCharges = this.maxCharges;

        this.landingArea = new BaseActor({
            radius: landingAreaData.radius,
            opacity: landingAreaData.opacity,
            z: 5,
        });

        this.landingArea.graphics.add(landingAreaGraphic);

        // 3 = 20

        this.label = new Label({
            text: generateLabelText(this.remainingCharges),
            color: landingAreaData.color,
            pos: new Vector(-7 + -4 * this.maxCharges, -13),
            font: new Font({
                size: 50,
            }),
            anchor: new Vector(0.5, 1)

        });
        this.landingArea.addChild(this.label);
    }

    onAdd(owner: BaseActor) {
        this.keyBoard = owner.get(KeyboardControlledComponent);

        this.keyBoard?.onKey(Keys.Space, this.initiateDash.bind(this));

        this.owner.on('postupdate', ({delta}) => {
            if (!this.dashing && this.remainingCharges < this.maxCharges) {
                this.remainingCharges = Math.min(
                    this.remainingCharges + (1 / this.rechargeTime) * delta,
                    this.maxCharges);
            }

            this.label.text = generateLabelText(this.remainingCharges);
        });

            owner.addChild(this.landingArea);

        this.owner.on<'moving'>('moving', ({direction}) => {
            if (this.dashing) {
                return;
            }

            this.landingArea.actions.clearActions();
            this.landingArea.actions.easeTo(direction.scaleEqual(this.maxDistance), 100);
        });
    }

    initiateDash(): void {
        if (!this.dashing && this.remainingCharges < 1) {
            return;
        }

        this.owner.once<'postupdate'>('postupdate', () => {
            const currentVelocity = this.owner.vel;
            if (currentVelocity.x === 0 && currentVelocity.y === 0) {
                return;
            }

            this.dashing = true;
            this.remainingCharges--;

            // this.owner.body.collisionType = CollisionType.Fixed;
            const collider = this.owner.collider.get();
            if (collider instanceof CircleCollider) {
                collider.radius += this.dashWakeRadius;
            }

            const dashVector = currentVelocity.normalize().scaleEqual(this.maxDistance);

            this.owner.actions.easeBy(dashVector, 300, EasingFunctions.EaseOutCubic).callMethod(this.recover.bind(this));
        });
    }

    recover(): void {
        this.dashing = false;

        const collider = this.owner.collider.get();
        if (collider instanceof CircleCollider) {
            collider.radius -= this.dashWakeRadius;
        }

        this.landingArea.graphics.opacity = landingAreaData.opacity;
    }
}