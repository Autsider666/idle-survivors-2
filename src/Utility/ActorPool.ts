import {BaseActor} from "../Actor/BaseActor.ts";

type BuilderCallback<A extends BaseActor> = () => A;

export class ActorPool<A extends BaseActor> {
    private readonly deadPool: A[] = [];
    private readonly builderCallback: BuilderCallback<A>;

    constructor(builderCallback: BuilderCallback<A>) {
        this.builderCallback = () => {
            const actor = builderCallback();
            actor.on<'postkill'>('postkill', () => {
                this.deadPool.push(actor);

                const parent = actor.parent;
                if (parent === null) {
                    actor.scene?.remove(actor);
                } else {
                    parent.removeChild(actor)
                }

                actor.vel.x = 0;
                actor.vel.y = 0;
                actor.pos.x = 0;
                actor.pos.y = 0;
            })
            return actor;
        }
    }

    public requestActor(): A {
        const actor = this.deadPool.pop();
        if (actor !== undefined) {
            return actor;
        }

        const newActor = this.builderCallback();
        console.debug('new', newActor.constructor.name, Date.now());

        return newActor;
    }
}