import { CollisionGroupManager, CollisionType, Color, Vector } from "excalibur";
import { BaseActor } from "./BaseActor";
import { PlayerControlledComponent } from "../Component/PlayerControlledComponent";

export const PlayerCollisionGroup = CollisionGroupManager.create('player');
export const PlayerTag = 'PLAYER_TAG';

export default class Player extends BaseActor {

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
        this.addComponent(new PlayerControlledComponent())
    }
}