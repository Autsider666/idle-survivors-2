import {BaseComponent} from "./BaseComponent.ts";
import {Random} from "excalibur";
import {Experience} from "../Actor/Experience.ts";
import {ActorPool} from "../Utility/ActorPool.ts";
import {XP_MAX_MERGE_RANGE} from "../config.ts";

type ExperienceValue = number | { min: number, max: number };

type Props = {
    experience: ExperienceValue,
}

const random = new Random();

const pool = new ActorPool<Experience>(() => new Experience());

export class DropsLootComponent extends BaseComponent {
    public readonly experience: ExperienceValue;

    constructor({experience}: Props) {
        super();

        this.experience = experience;
    }

    // onAdd(owner: BaseActor) {
    //     owner.on<'kill'>('kill', this.drop.bind(this));
    // }
    //
    // onRemove(owner: BaseActor) {
    //     owner.off<'kill'>('kill', this.drop.bind(this));
    // }

    public drop(): void {
        const owner = this.owner;
        if (owner === undefined) {
            return;
        }

        let experience = 0;
        if (!Number.isFinite(this.experience)) {
            const {min, max} = this.experience as { min: number, max: number };
            experience = random.integer(min, max);
        } else {
            experience = this.experience as number;
        }

        for (const actor of pool.activeActors) {
            if (owner.pos.distance(actor.pos) <= XP_MAX_MERGE_RANGE) {
                actor.value += experience;
                actor.startCountdown();

                return;
            }
        }

        const actor = pool.requestActor();
        actor.value = Math.round(experience);
        actor.pos.x = owner.pos.x;
        actor.pos.y = owner.pos.y;
        actor.startCountdown();


        owner.scene?.engine.add(actor);

    }
}