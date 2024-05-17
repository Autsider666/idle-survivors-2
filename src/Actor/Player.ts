import { Actor, CollisionGroupManager, CollisionType, Color, Engine, Vector } from "excalibur";
import { Direction, DirectionQueue } from "../Utility/DirectionQueue";
import { HealthComponent } from "../Component/HealthComponent";

export const PlayerCollisionGroup = CollisionGroupManager.create('player');
export const PlayerTag = 'PLAYER_TAG';

export default class Player extends Actor {
    private readonly directionQueue = new DirectionQueue();
    private speed: number = 160;

    constructor(x: number, y: number) {
        super({
            pos: new Vector(x, y),
            width: 32,
            height: 32,
            color: Color.Red,

            collisionType: CollisionType.Active,
            collisionGroup: PlayerCollisionGroup,
        });

        this.addTag(PlayerTag);

        // this.addComponent(new HealthComponent(100));

        // this.events.on('damage', () => {
        //     console.log('Auch!');
        // });


        // this.events.on('health', (data) => {
        //     console.log('Auch!', data);
        // });
    }

    onPreUpdate(engine: Engine): void {
        this.directionQueue.update(engine);

        this.handleMovement();
    }

    private handleMovement(): void {
        this.vel.x = 0;
        this.vel.y = 0;
        if (this.directionQueue.has(Direction.LEFT)) {
            this.vel.x = -1;
        }
        if (this.directionQueue.has(Direction.RIGHT)) {
            this.vel.x = 1;
        }
        if (this.directionQueue.has(Direction.UP)) {
            this.vel.y = -1;
        }
        if (this.directionQueue.has(Direction.DOWN)) {
            this.vel.y = 1;
        }

        // Normalize walking speed
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            this.vel = this.vel.normalize();
            this.vel.x *= this.speed;
            this.vel.y *= this.speed;
        }
    }
}