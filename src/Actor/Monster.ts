import {CircleCollider, CollisionType, Color, Rectangle, Vector} from "excalibur";
import {HealthComponent} from "../Component/HealthComponent";
import {DamageComponent} from "../Component/DamageComponent";
import {PlayerTag} from "./Player";
import {ChaseComponent} from "../Component/Movement/ChaseComponent.ts";
import {BaseActor} from "./BaseActor";
import {SCALE_2x} from "../Game/Constant";
import {CollisionGroup} from "../Game/CollisionGroups";
import {SearchComponent} from "../Component/SearchComponent.ts";
import {DropsLootComponent} from "../Component/DropsLootComponent.ts";
import {AttributeComponent} from "../Component/AttributeComponent.ts";
import {Attribute} from "../Utility/Attribute/AttributeStore.ts";

// const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 100;
// const MONSTER_DETECT_PLAYER_RANGE = 150;
// const MONSTER_DAMAGE_FREQUENCY = 500;
export const MonsterTag = 'MONSTER_TAG';

const form = new Rectangle({
    width: 8,
    height: 8,
    color: Color.ExcaliburBlue
});

// const grid = {
//     columns: 4,
//     rows: 4,
//     spriteWidth: 12,
//     spriteHeight: 20,
// };

// const spacing = {
//     originOffset: {
//         x: 6,
//         y: 4,
//     },
//     margin: {
//         x: 12,
//         y: 4,
//     },
// };

// const spriteSheet = SpriteSheet.fromImageSource({
//     image: Image.Character003,
//     grid,
//     spacing,
// });
//
// const animationSpeed = MONSTER_CHASE_VELOCITY;

export class Monster extends BaseActor {
    constructor() {
        super({
            scale: SCALE_2x,
            collider: new CircleCollider({radius: 7, offset: new Vector(0, 1)}),
            collisionType: CollisionType.Active,
            collisionGroup: CollisionGroup.Enemy,
        });

        this.graphics.add(form);
        // this.graphics.use(Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], 300))
        this.addTag(MonsterTag);

        this.addComponent(new AttributeComponent({
            [Attribute.Health]: 1,
            [Attribute.Speed]: MONSTER_CHASE_VELOCITY,
        }));
        this.addComponent(new HealthComponent());
        this.addComponent(new DamageComponent({damage: 1, targetTag: PlayerTag}));
        this.addComponent(new ChaseComponent());
        this.addComponent(new SearchComponent({queryTags: [PlayerTag]}));
        this.addComponent(new DropsLootComponent({experience: {min: 1, max: 3}}));
        // this.addComponent(new DirectionalAnimationComponent({
        //     idle: Animation.fromSpriteSheet(spriteSheet, [0], animationSpeed),
        //     left: Animation.fromSpriteSheet(spriteSheet, [4, 5, 6, 7], animationSpeed),
        //     right: Animation.fromSpriteSheet(spriteSheet, [8, 9, 10, 11], animationSpeed),
        //     up: Animation.fromSpriteSheet(spriteSheet, [12, 13, 14, 15], animationSpeed),
        //     down: Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], animationSpeed),
        // }));
    }
}

