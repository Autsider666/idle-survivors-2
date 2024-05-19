import { TagQuery } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

type ComponentProps = {
    speed: number,
    queryTags: string[],
}

export class ChaseComponent extends BaseComponent {
    private readonly speed: number;
    private readonly queryTags: string[];
    private query: TagQuery<string> | null = null;
    private target: BaseActor | null = null;

    constructor({ speed, queryTags }: ComponentProps) {
        super();

        this.speed = speed;
        this.queryTags = queryTags;
    }

    onAdd(owner: BaseActor): void {
        owner.on('preupdate', ({ engine }) => {
            if (this.query === null) {
                this.query = engine.currentScene.world.queryTags(this.queryTags);
            }

            this.checkTarget();
            if (this.target === null) {
                return;
            }


            const direction = this.target.pos.sub(this.owner.pos);
            const velosity = this.owner.vel;
            velosity.x = direction.x;
            velosity.y = direction.y;

            const normalizedVelosity = velosity.normalize();
            velosity.x = normalizedVelosity.x * this.speed;
            velosity.y = normalizedVelosity.y * this.speed;
        })
    }

    private checkTarget(): void {
        if (this.target !== null && !this.target.isKilled() || !this.query) {
            return;
        }

        const potentialTarget = this.query.entities[0];

        if (!(potentialTarget instanceof BaseActor)) {
            throw new Error('No player found to follow.')
        }

        this.target = potentialTarget;
    }
}