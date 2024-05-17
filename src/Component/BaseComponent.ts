import { Actor, Component } from "excalibur";

export abstract class BaseComponent extends Component {
    declare owner: Actor;
}