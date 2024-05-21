import {BaseComponent} from "./BaseComponent.ts";
import {Entity, Random} from "excalibur";
import {BaseActor} from "../Actor/BaseActor.ts";
import {Experience} from "../Actor/Experience.ts";

type ExperienceValue = number | { min: number, max: number };

type Props = {
    experience: ExperienceValue,
}

const random = new Random();

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
                const {min,max}  = experience;
                experience = random.integer(min, max);
            }

            owner.scene?.engine.add(new Experience({value: Math.round(experience), pos: owner.pos.clone()}))
        })
    }
}