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
import {Attribute, AttributeData} from "../Utility/Attribute/AttributeStore.ts";
import {AttributeComponent} from "../Component/AttributeComponent.ts";
import {CrosshairComponent} from "../Component/CrosshairComponent.ts";

export const PlayerTag = 'PLAYER_TAG';

const defaultPlayerAttributes: Partial<AttributeData> = {
    [Attribute.Speed]: 100,
    [Attribute.Dashes]: 2,
};

export default class Player extends BaseActor {
    constructor(pos: Vector, addWeapons: boolean = true, attributes: Partial<AttributeData> = {}) {
        super({
            pos,
            radius: 14,
            color: Color.Red,
            collisionType: CollisionType.Fixed,
            collisionGroup: CollisionGroup.Player,
        });

        this.addTag(PlayerTag);

        this.addComponent(new AttributeComponent({...defaultPlayerAttributes, ...attributes}));

        // this.addComponent(new HealthComponent(100));
        this.addComponent(new KeyboardControlledComponent());
        this.addComponent(new PointerControlledComponent());
        this.addComponent(new LevelComponent());

        this.addComponent(new CrosshairComponent());
        this.addComponent(new DashComponent());

        if (!addWeapons) {
            return;
        }

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