import { BaseActor } from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

export class MouseControlledComponent extends BaseMovementComponent {
    private trackPoints:boolean = false;
    
    constructor() {
        super();
        
        this.maxSpeed = 160;
    }
    
    onAdd(owner: BaseActor): void {
        owner.on<'initialize'>('initialize', this.initialize.bind(this));
    }

    private initialize():void {
        const pointer = this.owner.scene?.engine.input.pointers.primary;
        if (pointer === undefined) {
            throw new Error('Why no pointer?');
        }
        pointer.on<'down'>('down',() => {
            this.trackPoints =  true
        });
        pointer.on<'up'>('up',() => {
            this.trackPoints =  false
        });
        this.owner.on<'preupdate'>('preupdate', () => {
            if (!this.trackPoints){
                return;
            }

            this.moveInDirection(pointer.lastWorldPos.sub(this.owner.pos));
        })
    }
}