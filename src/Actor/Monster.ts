import {Circle, CircleCollider, CollisionType, Color, Vector} from "excalibur";
import {HealthComponent} from "../Component/HealthComponent";
import {DamageComponent} from "../Component/DamageComponent";
import {PlayerTag} from "./Player";
import {ChaseComponent} from "../Component/Movement/ChaseComponent.ts";
import {BaseActor} from "./BaseActor";
import {SCALE_2x} from "../Game/Constant";
import {CollisionGroup} from "../Game/CollisionGroups";
import {SearchComponent} from "../Component/SearchComponent.ts";
import {DropsLootComponent} from "../Component/DropsLootComponent.ts";

// const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 100;
// const MONSTER_DETECT_PLAYER_RANGE = 150;
// const MONSTER_DAMAGE_FREQUENCY = 500;
export const MonsterTag = 'MONSTER_TAG';

const circle = new Circle({
    radius: 8,
    color: Color.Black,
});

export class Monster extends BaseActor {
    constructor() {
        super({
            scale: SCALE_2x,
            collider: new CircleCollider({radius: 8}),
            collisionType: CollisionType.Active,
            collisionGroup: CollisionGroup.Enemy,
        });

        this.graphics.add(circle)

        this.addTag(MonsterTag);

        this.addComponent(new HealthComponent(1));
        this.addComponent(new DamageComponent({damage: 1, targetTag: PlayerTag}));
        this.addComponent(new ChaseComponent({speed: MONSTER_CHASE_VELOCITY}));
        this.addComponent(new SearchComponent({queryTags: [PlayerTag]}));
        this.addComponent(new DropsLootComponent({experience:{min: 1, max: 3}}));
    }
}

