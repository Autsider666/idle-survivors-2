import {Engine} from "excalibur";
import {DataConnection, Peer} from "peerjs";

export type NetworkIdentifier = string;

type Vector = {
    x: number,
    y: number,
};

export type NetworkUpdate = {
    id: number,
    position: Vector,
    velocity?: Vector,

}

export type ActorUpdate = {identifier: NetworkIdentifier, data: NetworkUpdate};

export const NETWORK_SEND_UPDATE_EVENT = 'network_send_update_event'
export const NETWORK_HANDLE_UPDATE_EVENT = 'network_handle_update_event'

export class NetworkClient {
    private readonly identifier: NetworkIdentifier;
    private readonly activeConnections = new Map<NetworkIdentifier, DataConnection>();
    private peer: Peer;

    constructor(private readonly engine: Engine, private readonly seed: number) {
        this.identifier = this.generateIdentifier();
    }

    private generateIdentifier(): NetworkIdentifier {
        return this.getGroupIdentifier() + '_' + self.crypto.randomUUID();
    }

    private getGroupIdentifier(): string {
        return "Player_" + this.seed;
    }

    async init(): Promise<void> {
        this.peer = new Peer(this.identifier, {
            host: 'localhost',
            port: 9002,
        });

        this.peer.on("error", (error) => {
            console.error(error);
        });

        this.peer.on('connection', connection => {
            this.handleConnection(connection);
        });

        window.addEventListener("unload", () => {
            this.peer.disconnect();
        });

        this.peer.listAllPeers((identifiers: string[]) => {
            const groupIdentifier = this.getGroupIdentifier();
            identifiers.filter(identifier => identifier.startsWith(groupIdentifier))
                .forEach(identifier => this.connect(identifier));
        });

        this.engine.on(NETWORK_SEND_UPDATE_EVENT, (update: NetworkUpdate) => this.sendUpdate(update));
    }

    private handleConnection(connection: DataConnection): void {
        const connectionIdentifier = connection.peer;
        connection.on('open', () => {
            this.activeConnections.set(connectionIdentifier, connection);
        });

        connection.on('data', (data:NetworkUpdate) => {
            const eventData: ActorUpdate = {identifier:connectionIdentifier, data}

            this.engine.emit(NETWORK_HANDLE_UPDATE_EVENT, eventData);
        });

        connection.on('close', () => {
            console.log('close', connectionIdentifier);
            this.activeConnections.delete(connectionIdentifier);
        })
    }

    private connect(id: NetworkIdentifier): void {
        if (this.identifier === id) {
            return;
        }
        const connection = this.peer.connect(id);

        this.handleConnection(connection);
    }

    private sendUpdate(update: NetworkUpdate):void {
        this.activeConnections.forEach(connection => connection.send(update))
    }
}