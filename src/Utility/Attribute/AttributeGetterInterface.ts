import {AttributeWatcher} from "./AttributeWatcher.ts";
import {Attribute, AttributeData} from "./AttributeStore.ts";
import {Handler} from "excalibur";

export interface AttributeGetterInterface<A extends Attribute = Attribute> {
    get(attribute: A): number;

    generateWatcher(attribute: A): AttributeWatcher<A>;

    onChange(attribute:A, callback: Handler<AttributeData[A]>): void;
}