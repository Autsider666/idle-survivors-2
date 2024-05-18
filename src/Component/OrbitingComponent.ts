import { PostUpdateEvent, Vector } from "excalibur";
import { BaseActor } from "../Actor/BaseActor";
import { BaseComponent } from "./BaseComponent";

type Props = {
    phase: number,
    target: BaseActor,
    radius: number,
    orbitsPerSecond: number,
    clockwise: boolean,
}

export class OrbitingComponent extends BaseComponent {
    private progression: number;

    private readonly target: BaseActor;
    private readonly radius: number;
    private readonly orbitsPerSecond: number;
    private readonly clockwise: boolean;

    constructor({
        target, radius, orbitsPerSecond, phase, clockwise
    }: Props) {
        super();

        this.target = target;
        this.radius = radius;
        this.orbitsPerSecond = orbitsPerSecond;
        this.clockwise = clockwise;
        this.progression = (phase ?? 0) * (1000.0 / this.orbitsPerSecond);
    }

    onAdd(owner: BaseActor): void {
        const radPerMs = (Math.PI * 2) / 1000 * this.orbitsPerSecond;
        owner.on('postupdate', ({ delta }: PostUpdateEvent) => {


            this.progression += this.clockwise ? delta : -delta;
            this.progression %= 1000.0 / this.orbitsPerSecond;

            const center = this.target.pos;
            const newAngle = Vector.fromAngle(this.progression * radPerMs);
            newAngle.x *= this.radius;
            newAngle.y *= this.radius;

            owner.pos.x = center.x + newAngle.x;
            owner.pos.y = center.y + newAngle.y;
        });
    }
}