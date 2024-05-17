import { Actor, CollisionGroupManager, CollisionType, Color, Vector } from "excalibur";
import { SCALE_2x } from "../Utility/Game";
import { HealthComponent } from "../Component/HealthComponent";
import { DamageComponent } from "../Component/DamageComponent";
import { PlayerTag } from "./Player";
import { ChaseComponent } from "../Component/ChaseComponent";

// const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 100;
// const MONSTER_DETECT_PLAYER_RANGE = 150;
const MONSTER_DAMAGE_FREQUENCY = 500;
export const MonsterTag = 'MONSTER_TAG';

export const MonsterCollisionGroup = CollisionGroupManager.create('monsters');

export class Monster extends Actor {
    constructor(x: number, y: number) {
        super({
            pos: new Vector(x, y),
            radius: 8,
            // width: 16,
            // height: 16,
            scale: SCALE_2x,
            // collider: Shape.Box(11, 10, ANCHOR_CENTER, new Vector(0, 4)),
            collisionType: CollisionType.Active,
            // collisionGroup: MonsterCollisionGroup,
            color: Color.Black,
        });

        this.addTag(MonsterTag);

        this.addComponent(new HealthComponent(1));
        this.addComponent(new DamageComponent({ amount: 1, targetTag: PlayerTag }));
        this.addComponent(new ChaseComponent({ queryTags: [PlayerTag], velosity: MONSTER_CHASE_VELOCITY }));
    }
}

