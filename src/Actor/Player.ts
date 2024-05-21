import { CollisionType, Color, Vector } from "excalibur";
import { BaseActor } from "./BaseActor";
import { PlayerControlledComponent } from "../Component/Movement/PlayerControlledComponent.ts";
import { CollisionGroup } from "../Game/CollisionGroups";
import {LevelComponent} from "../Component/LevelComponent.ts";

export const PlayerTag = 'PLAYER_TAG';

export default class Player extends BaseActor {

    constructor(x: number, y: number) {
        super({
            pos: new Vector(x, y),
            width: 32,
            height: 32,
            color: Color.Red,

            collisionType: CollisionType.Active,
            collisionGroup: CollisionGroup.Player,
        });

        this.addTag(PlayerTag);

        // this.addComponent(new HealthComponent(100));
        this.addComponent(new PlayerControlledComponent())
        this.addComponent(new LevelComponent())
    }
}