import {AttributeWatcher} from "./AttributeWatcher.ts";
import {EventEmitter} from "excalibur";

export enum Attribute {
    Speed = 'Speed'
}

export type AttributeData = {
    [key in Attribute]: number
}


export class AttributeStore {
    private readonly attributes: Partial<AttributeData> = {};
    private readonly watchers = new Map<Attribute, AttributeWatcher<Attribute>>();

    private readonly events = new EventEmitter<AttributeData>();

    constructor(data?: Partial<AttributeData>) {
        if (data !== undefined) {
            for (const [attribute, value] of Object.entries(data) as [attribute: Attribute, value: number][]) {
                this.set(attribute, value);
            }
        }
    }

    get(attribute: Attribute): number {
        return this.attributes[attribute] ?? 0;
    }

    set(attribute: Attribute, value: number): void {
        this.attributes[attribute] = value;
        this.events.emit(attribute, value);
    }

    change(attribute: Attribute, delta: number): void {
        const value = (this.attributes[attribute] ?? 0) + delta;

        this.attributes[attribute] = value;
        this.events.emit(attribute, value);
    }

    generateWatcher<A extends Attribute>(attribute: A): AttributeWatcher<A> {
        const watcher = this.watchers.get(attribute) as AttributeWatcher<A> | undefined;
        if (watcher !== undefined) {
            return watcher;
        }

        const newWatcher = new AttributeWatcher(attribute, this.events, this);
        this.watchers.set(attribute, newWatcher);

        return newWatcher;
    }
}