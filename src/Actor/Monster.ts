import {Animation, CircleCollider, CollisionType, SpriteSheet, Vector} from "excalibur";
import {HealthComponent} from "../Component/HealthComponent";
import {DamageComponent} from "../Component/DamageComponent";
import {PlayerTag} from "./Player";
import {ChaseComponent} from "../Component/Movement/ChaseComponent.ts";
import {BaseActor} from "./BaseActor";
import {SCALE_2x} from "../Game/Constant";
import {CollisionGroup} from "../Game/CollisionGroups";
import {SearchComponent} from "../Component/SearchComponent.ts";
import {DropsLootComponent} from "../Component/DropsLootComponent.ts";
import {Image} from "../Utility/ImageLoader.ts";
import {DirectionalAnimationComponent} from "../Component/Animation/DirectionalAnimationComponent.ts";

// const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 100;
// const MONSTER_DETECT_PLAYER_RANGE = 150;
// const MONSTER_DAMAGE_FREQUENCY = 500;
export const MonsterTag = 'MONSTER_TAG';

// const circle = new Circle({
//     radius: 8,
//     color: Color.Black,
// });

const grid = {
    columns: 4,
    rows: 4,
    spriteWidth: 12,
    spriteHeight: 20,
};

const spacing = {
    originOffset: {
        x: 6,
        y: 4,
    },
    margin: {
        x: 12,
        y: 4,
    },
};

const spriteSheet = SpriteSheet.fromImageSource({
    image: Image.Character003,
    grid,
    spacing,
});

const animationSpeed = MONSTER_CHASE_VELOCITY;

export class Monster extends BaseActor {
    constructor() {
        super({
            scale: SCALE_2x,
            collider: new CircleCollider({radius: 8, offset: new Vector(0, 1)}),
            collisionType: CollisionType.Active,
            collisionGroup: CollisionGroup.Enemy,
        });

        // this.graphics.add(circle);
        // this.graphics.use(Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], 300))
        this.addTag(MonsterTag);

        this.addComponent(new HealthComponent(1));
        this.addComponent(new DamageComponent({damage: 1, targetTag: PlayerTag}));
        this.addComponent(new ChaseComponent({speed: MONSTER_CHASE_VELOCITY}));
        this.addComponent(new SearchComponent({queryTags: [PlayerTag]}));
        this.addComponent(new DropsLootComponent({experience: {min: 1, max: 3}}));
        this.addComponent(new DirectionalAnimationComponent({
            idle: Animation.fromSpriteSheet(spriteSheet, [0], animationSpeed),
            left: Animation.fromSpriteSheet(spriteSheet, [4,5,6,7], animationSpeed),
            right: Animation.fromSpriteSheet(spriteSheet, [8,9,10,11], animationSpeed),
            up: Animation.fromSpriteSheet(spriteSheet, [12,13,14,15], animationSpeed),
            down: Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], animationSpeed),
        }));
    }
}

