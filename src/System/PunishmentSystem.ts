import {System, SystemType, TagQuery, World} from "excalibur";

export const PUNISHABLE_TAG = 'PUNISHABLE';

export class PunishmentSystem extends System {
    systemType: SystemType = SystemType.Draw;

    private readonly interval: number = 5000;
    private next: number = 0;

    private punishableQuery: TagQuery<string>;

    private punishableCounter:number = 0;

    constructor(world: World) {
        super();
        this.punishableQuery = world.queryTags([PUNISHABLE_TAG]);

        this.punishableQuery.entityAdded$.subscribe(() => this.punishableCounter++);
    }

    update(elapsedMs: number): void {
        this.next -= elapsedMs;
        if (this.next > 0) {
            return;
        }

        this.next = this.interval;

        // console.log(this.punishableQuery.entities.length, this.punishableCounter);
    }

}