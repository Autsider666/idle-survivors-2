import {BaseComponent} from "./BaseComponent.ts";
import {BaseActor} from "../Actor/BaseActor.ts";
import {EasingFunctions, Vector} from "excalibur";
import {MapGenFunction} from "../Game/WorldGen/MapGenFunction.ts";

export enum State {
    Stable = "Stable",
    Stabilizing = "Stabilizing",
    Destabilizing = "Destabilizing",
    Unstable = "Unstable"
}

export class UnstableComponent extends BaseComponent {
    private state: State = State.Unstable;
    private origin?: Vector;
    private target?: Vector;
    private readonly maxTime: number = 500;
    private finishIn: number = 0;

    // private lastStablePosition?:Vector;

    constructor(
        private readonly anchor: BaseActor,
        private readonly stabilizationRange: number,
        private readonly destabilizationRange?: number,
    ) {
        super();
    }

    get currentState():State {
        return this.state;
    }

    onAdd(owner: BaseActor) {

        owner.graphics.visible = false;
        owner.graphics.opacity = 0;
        // this.lastStablePosition = owner.pos.clone();
        owner.on('postupdate', ({delta}) => {
            const distance = owner.pos.distance(this.anchor.pos);
            switch (this.state) {
                case State.Stable:
                    if (this.destabilizationRange && distance > this.destabilizationRange) {
                        this.destabilize();
                    }
                    break;
                case State.Unstable:
                    if (distance <= this.stabilizationRange) {
                        this.stabilize();
                    }
                    break;
                case State.Stabilizing:
                case State.Destabilizing:
                    this.phasing(delta);
            }
        });

        owner.on('exitviewport', () => {
            if (this.state === State.Unstable) {
                return;
            }

            if (this.state === State.Destabilizing && this.origin) {
                owner.pos = this.origin;
            }

            if (this.state === State.Stabilizing && this.target) {
                owner.pos = this.target;
            }

            this.state = State.Unstable;
            owner.graphics.opacity = 0;
            owner.graphics.visible = false;
        });
    }

    stabilize(): void {
        const owner = this.owner;
        if (!owner || this.state !== State.Unstable) {
            return;
        }

        if (owner.scene === undefined) {
            this.state = State.Stable;
            owner.graphics.opacity = 1;
            return;
        }

        owner.graphics.visible = true;
        owner.graphics.opacity = 0;

        // const fadeSpeed = MapGenFunction.lerp(distance, 500, 0.2);
        // const fadeIn = new ParallelActions([
        //     new Fade(owner, 1, fadeSpeed),//MapGenFunction.lerp(distance, 1000, 0.5)),
        //     new EaseTo(owner, owner.pos.x, owner.pos.y, MapGenFunction.lerp(distance, 500, 0.4), EasingFunctions.EaseInOutCubic)
        // ]);

        this.state = State.Stabilizing;
        this.finishIn = this.maxTime;

        const distance = this.anchor.pos.distance(owner.pos);
        const startPos = owner.pos.add(owner.pos.sub(this.anchor.pos).normalize().scale(MapGenFunction.lerp(0, distance, 0.5)));

        this.origin = startPos;
        this.target = owner.pos.clone();
        owner.pos = startPos;

        // owner.actions
        //     .moveTo(startPos, 1000)
        //     .runAction(fadeIn)
        //     .callMethod(() => this.state = State.Stable);
    }

    destabilize(): void {
        const owner = this.owner;
        if (!owner || this.state !== State.Stable) {
            return;
        }

        this.state = State.Destabilizing;
        this.finishIn = this.maxTime;
        this.origin = owner.pos.clone();
        const distance = this.anchor.pos.distance(owner.pos);
        this.target = owner.pos.add(owner.pos.sub(this.anchor.pos).normalize().scale(distance / 15));

        // owner.actions.clearActions();
        //
        // const distance = sourceLocation.distance(this.pos);
        //
        // // const fadeVector = this.pos.sub(sourceLocation).normalize().scale(distance / 15);
        // // tile.scale = new Vector(2,2);
        //
        // const fadeOut = new ParallelActions([
        //     // new ScaleTo(tile,1,1,1.5,1.5),
        //     new Fade(this, 0, MapGenFunction.lerp(distance, 500, 0.8)),
        //     // new EaseTo(this, this.pos.x, this.pos.y, MapGenFunction.lerp(distance, 500, 0.4), EasingFunctions.EaseInQuad)
        // ]);
        // // this.pos = this.pos.add(fadeVector);
        // this.actions
        //     .moveTo(this.backupPos, 10000)
        //     .runAction(fadeOut)
        //     .callMethod(() => this.state = State.Unstable);
    }

    private phasing(delta: number) {
        const owner = this.owner;
        const target = this.target;
        const origin = this.origin;
        if (!owner || !target || !origin) {
            return;
        }


        const anchorDistance = this.anchor.pos.distance(owner.pos);
        const modified = Math.max(0, 100 - anchorDistance);
        const speedBoost = EasingFunctions.EaseInCubic(modified, 1, 5, 50);
        this.finishIn -= delta * speedBoost;
        let finished = false;
        if (this.finishIn <= 0) {
            this.finishIn = 0;
            finished = true;
        }
        // const targetDistance = target.distance(owner.pos);
        // Distance > 100 = 1 = begin of curve
        // Distance < 100 = 1+
        // Distance < 50 = 5 = end of curve

        const currentTime = this.maxTime - this.finishIn;

        // const phaseSpeed = MapGenFunction.lerp(distance, 500, 0.2);
        if (this.state === State.Stabilizing) {
            owner.graphics.opacity = EasingFunctions.EaseInOutCubic(currentTime, 0, 1, this.maxTime);
            owner.pos.x = EasingFunctions.EaseInOutCubic(currentTime, origin.x, target.x, this.maxTime);
            owner.pos.y = EasingFunctions.EaseInOutCubic(currentTime, origin.y, target.y, this.maxTime);
            if (finished) {
                this.state = State.Stable;
                owner.graphics.opacity = 1;
                owner.pos = target;
            }
        } else if (this.state === State.Destabilizing) {
            owner.graphics.opacity = EasingFunctions.EaseInOutCubic(currentTime, 1, -0.5, this.maxTime);
            owner.pos.x = EasingFunctions.EaseInOutCubic(currentTime, origin.x, target.x, this.maxTime);
            owner.pos.y = EasingFunctions.EaseInOutCubic(currentTime, origin.y, target.y, this.maxTime);
            if (finished) {
                this.state = State.Unstable;
                owner.graphics.opacity = 0;
                owner.pos = origin;
                owner.graphics.visible = false;
            }
        }
    }
}