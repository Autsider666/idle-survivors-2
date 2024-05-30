import {Attribute, AttributeData, AttributeStore} from "./AttributeStore.ts";
import {EventEmitter, Handler} from "excalibur";

export class AttributeWatcher<A extends Attribute> {
    constructor(
        public readonly attribute: A,
        private readonly events: EventEmitter<AttributeData>,
        private readonly store: AttributeStore, // TODO one day split in AttributeStoreSetter/Getter interfaces?
    ) {

    }

    get value(): number {
        return this.store.get(this.attribute);
    }

    onChange(callback: Handler<AttributeData[A]>): void {
        this.events.on<A>(this.attribute, callback);
    }

    offChange(callback: Handler<AttributeData[A]>): void {
        this.events.off<A>(this.attribute, callback);
    }
}