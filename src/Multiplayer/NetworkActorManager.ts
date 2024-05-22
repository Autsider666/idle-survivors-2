import {Color, Engine} from "excalibur";
import {BaseActor} from "../Actor/BaseActor.ts";
import {ActorUpdate, NETWORK_HANDLE_UPDATE_EVENT, NetworkIdentifier} from "./NetworkClient.ts";

export class NetworkActorManager {
    private readonly networkActors = new Map<NetworkIdentifier, BaseActor>();
    constructor(private readonly engine:Engine) {
        engine.on(NETWORK_HANDLE_UPDATE_EVENT, this.handleUpdate.bind(this))
    }

    private handleUpdate({identifier, data}:ActorUpdate):void {
        const actor:BaseActor | undefined = this.networkActors.get(identifier);
        if (actor === undefined) {
            const newActor  = new BaseActor({
                radius: 5,
                color: Color.Chartreuse,
                x: data.position.x,
                y: data.position.y,
            });

            this.networkActors.set(identifier, newActor);

            this.engine.add(newActor);
            return;
        }

        actor.pos.x = data.position.x;
        actor.pos.y = data.position.y;
    }
}