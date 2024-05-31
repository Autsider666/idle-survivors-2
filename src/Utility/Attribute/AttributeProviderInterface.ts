import {AttributeWatcher} from "./AttributeWatcher.ts";
import {Attribute} from "./AttributeStore.ts";

export interface AttributeProviderInterface {
    getAttribute<A extends Attribute>(attribute: A): AttributeWatcher<A>;
}