import {Attribute} from "./AttributeStore.ts";

export interface AttributeSetterInterface<A extends Attribute = Attribute> {
    set(attribute: A, value: number): void;

    change(attribute: A, delta: number): void;
}