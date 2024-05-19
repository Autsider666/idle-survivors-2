import { CollisionType, Color, Engine, Vector } from "excalibur";
import { HealthComponent } from "../Component/HealthComponent";
import { DamageComponent } from "../Component/DamageComponent";
import { PlayerTag } from "./Player";
import { ChaseComponent } from "../Component/ChaseComponent";
import { BaseActor } from "./BaseActor";
import { SCALE_2x } from "../Game/Constant";
import { CollisionGroup } from "../Game/CollisionGroups";

// const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 100;
// const MONSTER_DETECT_PLAYER_RANGE = 150;
// const MONSTER_DAMAGE_FREQUENCY = 500;
export const MonsterTag = 'MONSTER_TAG';

export class Monster extends BaseActor {
    constructor(x: number, y: number) {
        super({
            pos: new Vector(x, y),
            radius: 8,
            scale: SCALE_2x,
            collisionType: CollisionType.Active,
            collisionGroup: CollisionGroup.Enemy,
            color: Color.Black,
        });

        this.addTag(MonsterTag);

        this.addComponent(new HealthComponent(1));
        this.addComponent(new DamageComponent({ damage: 1, targetTag: PlayerTag }));
        this.addComponent(new ChaseComponent({ queryTags: [PlayerTag], speed: MONSTER_CHASE_VELOCITY }));
    }
}

