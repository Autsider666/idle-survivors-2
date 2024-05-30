import {Component} from "excalibur";
import { BaseActor } from "../Actor/BaseActor";

export abstract class BaseComponent extends Component {
    declare owner?: BaseActor;

    abstract onAdd?(owner: BaseActor):void;
}