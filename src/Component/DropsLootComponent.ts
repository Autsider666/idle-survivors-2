import {BaseComponent} from "./BaseComponent.ts";
import {Random} from "excalibur";
import {BaseActor} from "../Actor/BaseActor.ts";
import {Experience} from "../Actor/Experience.ts";
import {ActorPool} from "../Utility/ActorPool.ts";

type ExperienceValue = number | { min: number, max: number };

type Props = {
    experience: ExperienceValue,
}

const random = new Random();

const pool = new ActorPool<Experience>(() => new Experience())

export class DropsLootComponent extends BaseComponent {
    public readonly experience: ExperienceValue;

    constructor({experience}) {
        super();

        this.experience = experience;
    }

    onAdd(owner: BaseActor) {
        owner.on<'kill'>('kill', ({}) => {
            let experience = this.experience;
            if (!Number.isFinite(experience)) {
                const {min, max} = experience;
                experience = random.integer(min, max);
            }

            const actor = pool.requestActor();
            actor.value = Math.round(experience);
            actor.pos.x = owner.pos.x;
            actor.pos.y = owner.pos.y;
            actor.startCountdown();


            owner.scene?.engine.add(actor);
        })
    }
}