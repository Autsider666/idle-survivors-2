import {BaseComponent} from "./BaseComponent.ts";
import {Vector} from "excalibur";

export class GridComponent extends BaseComponent {
    constructor(
        private tileSize: number,
    ) {
        super();
    }

    private toGridPos(value:number):number{
        return Math.round((value - this.tileSize / 2) / this.tileSize);
    }

    get x(): number {
        if (this.owner === undefined) {
            throw new Error('Too early');
        }

        return this.toGridPos(this.owner.pos.x);
    }

    get y(): number {
        if (this.owner === undefined) {
            throw new Error('Too early');
        }

        return this.toGridPos(this.owner.pos.y);
    }

    get point(): Vector {
        return new Vector(this.x, this.y);
    }
}