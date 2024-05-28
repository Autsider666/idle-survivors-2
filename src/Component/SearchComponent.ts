import {BaseComponent} from "./BaseComponent.ts";
import {TagQuery} from "excalibur";
import {BaseActor} from "../Actor/BaseActor.ts";
import {TargetComponent} from "./TargetComponent.ts";

export class SearchComponent extends BaseComponent {
    private readonly queryTags: string[];
    private query: TagQuery<string> | null = null;

    constructor({ queryTags }: { queryTags: string[] }) {
        super();

        this.queryTags = queryTags;
    }

    onAdd(owner: BaseActor): void {
        owner.on<'preupdate'>('preupdate', ({ engine }) => {
            if (owner.has(TargetComponent)) {
                return;
            }

            if (this.query === null) {
                this.query = engine.currentScene.world.queryTags(this.queryTags);
            }

            const target = this.query?.entities[0];

            if (!(target instanceof BaseActor)) {
                throw new Error('No player found to follow.');
            }

            owner.addComponent(new TargetComponent({target}));
        });
    }
}