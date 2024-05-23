import { BaseActor } from "../../Actor/BaseActor.ts";
import {BaseMovementComponent} from "./BaseMovementComponent.ts";

export class PointerControlledComponent extends BaseMovementComponent {
    private trackPointer:boolean = false;
    
    constructor() {
        super();
        
        this.maxSpeed = 160;
    }
    
    onAdd(owner: BaseActor): void {
        owner.on<'initialize'>('initialize', this.initialize.bind(this));
    }

    private initialize():void {
        const engine = this.owner.scene?.engine;
        if (engine === undefined) {
            throw new Error('Why no engine?');
        }
        const pointer = engine.input.pointers.primary;
        if (pointer === undefined) {
            throw new Error('Why no pointer?');
        }

        pointer.on<'down'>('down',() => {
            this.trackPointer =  true
        });

        pointer.on<'up'>('up',() => {
            this.trackPointer =  false
        });

        this.owner.on<'preupdate'>('preupdate', () => {
            if (!this.trackPointer){
                return;
            }

            this.moveInDirection(engine.screen.screenToWorldCoordinates(pointer.lastScreenPos).sub(this.owner.pos));
        })
    }
}