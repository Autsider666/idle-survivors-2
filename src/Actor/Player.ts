import {CollisionType, Color, Engine, Vector} from "excalibur";
import {BaseActor} from "./BaseActor";
import {KeyboardControlledComponent} from "../Component/Movement/KeyboardControlledComponent.ts";
import {CollisionGroup} from "../Game/CollisionGroups";
import {LevelComponent} from "../Component/LevelComponent.ts";
import {Weapon} from "./Tool/Weapon.ts";
import {NETWORK_SEND_UPDATE_EVENT, NetworkUpdate} from "../Multiplayer/NetworkClient.ts";
import {ItemCollector} from "./Tool/ItemCollector.ts";
import {PointerControlledComponent} from "../Component/Movement/PointerControlledComponent.ts";

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
        this.addComponent(new KeyboardControlledComponent())
        this.addComponent(new PointerControlledComponent())
        this.addComponent(new LevelComponent())

        this.addChild(new Weapon(150, Color.Magenta, 3));
        this.addChild(new ItemCollector(100));
    }

    onInitialize(engine: Engine) {
        this.on<'postupdate'>('postupdate', () => {
            if (this.vel.x !== 0 || this.vel.y !== 0) {

                const update: NetworkUpdate = {
                    id: this.id,
                    position: {
                        x: this.pos.x,
                        y: this.pos.y,
                    },
                    velocity: {
                        x: this.vel.x,
                        y: this.vel.y,
                    },
                };
                engine.emit(NETWORK_SEND_UPDATE_EVENT, update)
            }
        })
    }
}