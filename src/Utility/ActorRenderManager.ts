import {BaseActor} from "../Actor/BaseActor.ts";
import {
    BoundingBox,
    CoordPlane,
    Engine, ExitViewPortEvent,
    GraphicsComponent,
    Scene,
    TransformComponent,
    Vector
} from "excalibur";

export class ActorRenderManager {
    private readonly inactiveActors: BaseActor[] = []; //TODO REPLACE WITH SET?
    private readonly registeredActors: BaseActor[] = [];

    constructor(private readonly maxMsRandomSpread?:number, private currentScene?: Scene) {
    }

    public check(engine: Engine, distanceOffscreen: number = 0): void {
        if (this.currentScene === undefined) {
            throw new Error('No current scene');
        }

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

            console.debug('Render manager adding',inactiveActor.name);
            this.currentScene.add(inactiveActor);
            this.inactiveActors.splice(this.inactiveActors.indexOf(inactiveActor), 1);
        }
    }

    public add(actor: BaseActor): void {
        if (this.registeredActors.includes(actor)) {
            return;
        }

        actor.on<'exitviewport'>('exitviewport', this.onActorExitViewPort.bind(this));

        this.inactiveActors.push(actor);
        this.registeredActors.push(actor);
    }

    public remove(actor: BaseActor): void {
        if (!this.registeredActors.includes(actor)) {
            return;
        }

        if (this.inactiveActors.includes(actor)) {
            this.inactiveActors.splice(this.inactiveActors.indexOf(actor), 1);
        }


        this.inactiveActors.splice(this.inactiveActors.indexOf(actor), 1);
    }

    private isActorOffscreen(actor: BaseActor, worldBounds: BoundingBox): boolean {
        const transform: TransformComponent = actor.get(TransformComponent);
        const graphics: GraphicsComponent = actor.get(GraphicsComponent);
        if (transform.coordPlane === CoordPlane.World) {
            const bounds = graphics.localBounds;
            const transformedBounds = bounds.transform(transform.get().matrix);
            return !worldBounds.overlaps(transformedBounds);
        } else {
            // TODO screen coordinates
            return false;
        }
    }

    private onActorExitViewPort(event: ExitViewPortEvent): void {
        if (this.currentScene === undefined) {
            throw new Error('No current scene');
        }

        const {target} = event as ExitViewPortEvent & { target: BaseActor };
        if (this.inactiveActors.includes(target)) {
            return;
        }

        console.debug('Render manager removing',target.name);

        this.currentScene.remove(target);

        const queueCallback = ()=> this.inactiveActors.push(target);
        if (this.maxMsRandomSpread) {
            setTimeout(queueCallback,Math.ceil(this.maxMsRandomSpread * Math.random()));
        } else {
            queueCallback();
        }
    }

    setScene(scene: Scene) {
        this.currentScene = scene;
        //TODO (re)move all current actors?
    }
}