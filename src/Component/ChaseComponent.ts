import { TagQuery } from "excalibur";
import { BaseComponent } from "./BaseComponent";
import { BaseActor } from "../Actor/BaseActor";

type ComponentProps = {
    velosity: number,
    queryTags: string[],
}

export class ChaseComponent extends BaseComponent {
    private readonly velosity: number;
    private readonly queryTags: string[];
    private query: TagQuery<string> | null = null;
    private target: BaseActor | null = null;

    constructor({ velosity, queryTags }: ComponentProps) {
        super();

        this.velosity = velosity;
        this.queryTags = queryTags;
    }

    onAdd(owner: BaseActor): void {
        owner.on('preupdate', () => {
            if (this.query === null) {
                const engine = owner.scene?.engine;
                if (!engine) {
                    return;
                }
                this.query = engine.currentScene.world.queryTags(this.queryTags);
            }

            if (this.target !== null && !this.target.isKilled()) {
                return;
            }

            const potentialTarget = this.query.entities[0];

            if (!(potentialTarget instanceof BaseActor)) {
                throw new Error('No player found to follow.')
            }

            this.target = potentialTarget;

            // TODO Could potentially queue up multiple meet actions.
            owner.actions.meet(this.target, this.velosity);
        })
    }
}