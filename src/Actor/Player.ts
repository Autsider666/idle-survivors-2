import {CollisionType, Color, Engine, Vector} from "excalibur";
import {BaseActor} from "./BaseActor";
import {KeyboardControlledComponent} from "../Component/Movement/KeyboardControlledComponent.ts";
import {CollisionGroup} from "../Game/CollisionGroups";
import {LevelComponent} from "../Component/LevelComponent.ts";
import {NETWORK_SEND_UPDATE_EVENT, NetworkUpdate} from "../Multiplayer/NetworkClient.ts";
import {ItemCollector} from "./Tool/ItemCollector.ts";
import {PointerControlledComponent} from "../Component/Movement/PointerControlledComponent.ts";
import {WEAPONS} from "../config.ts";
import {DashComponent} from "../Component/Movement/DashComponent.ts";

export const PlayerTag = 'PLAYER_TAG';

export default class Player extends BaseActor {

    constructor(pos: Vector, addWeapons: boolean = true) {
        super({
            pos,
            radius: 14,
            // width: 32,
            // height: 32,
            color: Color.Red,
            collisionType: CollisionType.Fixed,
            collisionGroup: CollisionGroup.Player,
        });

        // this.graphics.use(new Circle({
        //     radius: 12,
        //     color: Color.Red,
        //     lineWidth: 1,
        //     strokeColor: Color.Orange,
        // }));

        this.addTag(PlayerTag);

        const speed:number = 100;

        // this.addComponent(new HealthComponent(100));
        this.addComponent(new KeyboardControlledComponent(speed));
        this.addComponent(new PointerControlledComponent(speed));
        this.addComponent(new LevelComponent());
        this.addComponent(new DashComponent());

        if (!addWeapons) {
            return;
        }

        // this.addChild(new Weapon(150, Color.Magenta, 3));
        for (const data of Object.values(WEAPONS)) {
            if (data.minLevel) {
                continue;
            }

            this.addChild(new data.type(data));

        }
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
                engine.emit(NETWORK_SEND_UPDATE_EVENT, update);
            }
        });
    }
}