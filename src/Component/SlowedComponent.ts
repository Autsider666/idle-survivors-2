import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

// const emitter: ParticleEmitter = new ParticleEmitter({ width: 2, height: 2 });
// emitter.emitterType = EmitterType.Circle;
// emitter.radius = 5;
// emitter.minVel = 20;
// emitter.maxVel = 40;
// emitter.minAngle = 0;
// emitter.maxAngle = 6.2;
// emitter.isEmitting = true;
// emitter.emitRate = 5;
// emitter.opacity = 0;
// emitter.fadeFlag = true;
// emitter.particleLife = 400;
// emitter.maxSize = 10;
// emitter.minSize = 1;
// emitter.startSize = 0;
// emitter.endSize = 0;
// emitter.acceleration = new Vector(0, 0);
// emitter.beginColor = Color.Cyan;
// emitter.endColor = Color.Blue;

export class SlowedComponent extends BaseComponent {
    public counter = 0;
    // private readonly emitter: ParticleEmitter;

    constructor() {
        super();

        // this.emitter = new ParticleEmitter({ width: 2, height: 2 });
        // this.emitter.emitterType = EmitterType.Circle;
        // this.emitter.radius = 5;
        // this.emitter.minVel = 20;
        // this.emitter.maxVel = 40;
        // this.emitter.minAngle = 0;
        // this.emitter.maxAngle = 6.2;
        // this.emitter.isEmitting = true;
        // this.emitter.emitRate = 5;
        // this.emitter.opacity = 0;
        // this.emitter.fadeFlag = true;
        // this.emitter.particleLife = 400;
        // this.emitter.maxSize = 10;
        // this.emitter.minSize = 1;
        // this.emitter.startSize = 0;
        // this.emitter.endSize = 0;
        // this.emitter.acceleration = new Vector(0, 0);
        // this.emitter.beginColor = Color.Cyan;
        // this.emitter.endColor = Color.Blue;
    }

    onAdd(owner: BaseActor): void {
        // owner.addChild(this.emitter);

        owner.on<'preupdate'>('preupdate', () => {
            if (this.counter <= 0) {
                // this.emitter.isEmitting = false;
                return;
            }

            // this.emitter.isEmitting = true;
            owner.vel = owner.vel.scale(0.5);
        });
    }

    // onRemove(previousOwner: Entity<any>): void {
    //     this.emitter.isEmitting = false;
    //     this.emitter.kill();
    // }
}