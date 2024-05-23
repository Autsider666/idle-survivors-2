import {BaseActor} from "../Actor/BaseActor.ts";

type BuilderCallback<A extends BaseActor> = () => A;

export class ActorPool<A extends BaseActor> {
    private readonly deadPool: A[] = [];
    private readonly activePool: A[] = [];
    private readonly builderCallback: BuilderCallback<A>;

    constructor(builderCallback: BuilderCallback<A>, cleanupCallback?: (actor: A) => void) {
        this.builderCallback = () => {
            const actor = builderCallback();
            actor.on<'postkill'>('postkill', () => {
                this.activePool.splice(this.activePool.indexOf(actor), 1);
                this.deadPool.push(actor);

                const parent = actor.parent;
                if (parent === null) {
                    actor.scene?.remove(actor);
                } else {
                    parent.removeChild(actor);
                }

                actor.vel.x = 0;
                actor.vel.y = 0;
                actor.pos.x = 0;
                actor.pos.y = 0;

                if (cleanupCallback) {
                    cleanupCallback(actor);
                }
            });

            console.debug('new', actor.constructor.name, Date.now());

            return actor;
        };
    }

    public requestActor(): A {
        const actor = this.deadPool.pop() ?? this.builderCallback();
        this.activePool.push(actor);

        return actor;
    }

    get activeActors(): A[] {
        return this.activePool;
    }

    get deadActors(): A[] {
        return this.deadPool;
    }
}