import {BaseComponent} from "./BaseComponent.ts";
import {Attribute, AttributeData, AttributeStore} from "../Utility/Attribute/AttributeStore.ts";
import {AttributeGetterInterface} from "../Utility/Attribute/AttributeGetterInterface.ts";
import {AttributeWatcher} from "../Utility/Attribute/AttributeWatcher.ts";
import {Handler} from "excalibur";

export class AttributeComponent extends BaseComponent implements AttributeGetterInterface {
    private readonly store: AttributeStore;

    constructor(attributes?: Partial<AttributeData>) {
        super();

        this.store = new AttributeStore(attributes);
    }

    onChange(attribute: Attribute, callback: Handler<number>): void {
        this.store.onChange(attribute, callback);
    }

    get(attribute: Attribute): number {
        return this.store.get(attribute);
    }

    generateWatcher<A extends Attribute>(attribute: A): AttributeWatcher<A> {
        return this.store.generateWatcher(attribute);
    }

}