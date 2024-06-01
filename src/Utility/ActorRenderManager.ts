import {BaseActor} from "../Actor/BaseActor.ts";
import {
    BoundingBox,
    CoordPlane,
    Engine, ExitViewPortEvent,
    GraphicsComponent,
    TransformComponent,
    Vector
} from "excalibur";

type ActorStore = {
    add: (actor: BaseActor) => void;
    remove: (actor: BaseActor) => void;
}

export class ActorRenderManager {
    private readonly inactiveActors: Set<BaseActor> = new Set<BaseActor>();
    private readonly registeredActors: BaseActor[] = [];

    constructor(private readonly scene: ActorStore) {
    }

    public check(engine: Engine, distanceOffscreen: number = 0): void {
        let worldBounds = engine.screen.getWorldBounds();
        if (distanceOffscreen !== 0) {
            const worldBoundPoints = worldBounds.getPoints();
            worldBoundPoints[0] = worldBoundPoints[0].add(new Vector(-distanceOffscreen, -distanceOffscreen));
            worldBoundPoints[1] = worldBoundPoints[1].add(new Vector(distanceOffscreen, -distanceOffscreen));
            worldBoundPoints[2] = worldBoundPoints[2].add(new Vector(distanceOffscreen, distanceOffscreen));
            worldBoundPoints[3] = worldBoundPoints[3].add(new Vector(-distanceOffscreen, distanceOffscreen));
            worldBounds = BoundingBox.fromPoints(worldBoundPoints);
        }

        for (const inactiveActor of this.inactiveActors) {
            if (this.isActorOffscreen(inactiveActor, worldBounds)) {
                continue;
            }

            console.debug('Render manager adding', inactiveActor.name);
            this.scene.add(inactiveActor);
            this.inactiveActors.delete(inactiveActor);
        }
        // console.log(this.inactiveActors.size);
        // throw new Error('2');
    }

    public has(actor: BaseActor): boolean {
        return this.registeredActors.includes(actor);
    }

    public add(actor: BaseActor): void {
        if (this.registeredActors.includes(actor)) {
            return;
        }

        actor.on<'exitviewport'>('exitviewport', this.onActorExitViewPort.bind(this));

        this.inactiveActors.add(actor);
        this.registeredActors.push(actor);
    }

    public remove(actor: BaseActor): void {
        if (!this.registeredActors.includes(actor)) {
            return;
        }


        this.inactiveActors.delete(actor);
    }

    public reset() {
        this.registeredActors.forEach(actor => actor.off('exitviewport', this.onActorExitViewPort.bind(this)));
        this.registeredActors.length = 0;
        this.inactiveActors.clear();
    }

    private isActorOffscreen(actor: BaseActor, worldBounds: BoundingBox): boolean {
        const transform: TransformComponent = actor.get(TransformComponent);
        const graphics: GraphicsComponent = actor.get(GraphicsComponent);
        if (transform.coordPlane === CoordPlane.World) {
            const bounds = graphics.localBounds;
            const transformedBounds = bounds.transform(transform.get().matrix);

            // console.log(bounds, transformedBounds, !worldBounds.overlaps(transformedBounds));
            return !worldBounds.overlaps(transformedBounds);
        } else {
            // TODO screen coordinates
            return false;
        }
    }

    private onActorExitViewPort(event: ExitViewPortEvent): void {
        const {target} = event as ExitViewPortEvent & { target: BaseActor };
        if (this.inactiveActors.has(target)) {
            return;
        }

        console.debug('Render manager removing', target.name);

        this.scene.remove(target);
        this.inactiveActors.add(target);
    }
}