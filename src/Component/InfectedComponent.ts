import {BaseComponent} from "./BaseComponent.ts";
import {BaseActor} from "../Actor/BaseActor.ts";
import {
    ActionContext,
    CollisionGroup as ExCollisionGroup,
    CollisionType,
    Color,
    ParallelActions,
    Random,
    Raster, RepeatForever,
    Vector
} from "excalibur";
import {CollisionGroup} from "../Game/CollisionGroups.ts";
import {HealthComponent} from "./HealthComponent.ts";
import {DropsLootComponent} from "./DropsLootComponent.ts";
import {INFECTABLE_TAG} from "../System/InfectionSpawnerSystem.ts";

type BackupData = {
    color: Color,
    strokeColor: Color,
    lineWidth: number,
    collisionGroup: ExCollisionGroup,
    collisionType: CollisionType,
}

const random = new Random();

export class InfectedComponent extends BaseComponent {
    private backup?:BackupData;
    onAdd(owner: BaseActor) {
        const graphic = owner.graphics.current;
        if (!(graphic instanceof Raster)) {
            return;
        }

        owner.removeTag(INFECTABLE_TAG);

        this.backup = {
            color: graphic.color,
            strokeColor: graphic.strokeColor,
            lineWidth: graphic.lineWidth,
            collisionGroup: owner.body.group,
            collisionType: owner.body.collisionType,
        };

        graphic.color = Color.fromRGB(115,0,115);
        graphic.strokeColor = Color.fromRGB(124,139,81);
        // graphic.color = Color.fromRGB(124,139,81);
        // graphic.strokeColor = Color.fromRGB(115,0,115);
        graphic.lineWidth = 3;
        owner.body.group = CollisionGroup.Enemy;
        owner.body.collisionType = CollisionType.Fixed;

        const lootComponent = new DropsLootComponent({experience: {min: 1, max: 3}});
        owner.addComponent(lootComponent);
        owner.addComponent(new HealthComponent(1, owner =>{
            lootComponent.drop();
            owner.removeComponent(InfectedComponent);
        }));

        owner.graphics.opacity = random.floating(0.8,1);
        const scale = random.floating(0.95,1);
        owner.scale = new Vector(scale,scale);

        const heartBeatMin:Vector =new Vector(1,1);
        const heartBeatMax:Vector =new Vector(0.95,0.95);
        const heartBeatSpeedIn:Vector =new Vector(0.1,0.1);
        const heartBeatSpeedOut:Vector =new Vector(0.3,0.3);
        const heartBeatLoop: ((repeatCtx:ActionContext)=>void)[] = [
            (repeatCtx:ActionContext) => repeatCtx.scaleTo(heartBeatMin,heartBeatSpeedIn),// 0 = 0.75
            (repeatCtx:ActionContext) => repeatCtx.scaleTo(heartBeatMax,heartBeatSpeedOut),// 20 = 1.00
            (repeatCtx:ActionContext) => repeatCtx.scaleTo(heartBeatMin,heartBeatSpeedIn),// 40 = 0.75
            (repeatCtx:ActionContext) => repeatCtx.scaleTo(heartBeatMax,heartBeatSpeedOut),// 60 = 1.00
            (repeatCtx:ActionContext) => repeatCtx.scaleTo(heartBeatMin,heartBeatSpeedIn),// 80 = 0.75
            (repeatCtx:ActionContext) => repeatCtx.delay(500), // 100 = 0.75
        ];

        const loopProgress = random.integer(0, heartBeatLoop.length - 1);

        const creepy = new ParallelActions([
            new RepeatForever(owner, repeatCtx => {
                repeatCtx.fade(0.8,1000);
                repeatCtx.fade(1.2,1000);
            }),
            new RepeatForever(owner, repeatCtx => {
                for (let i = 0; i < heartBeatLoop.length; i++) {
                    heartBeatLoop[(i + loopProgress)% (heartBeatLoop.length)](repeatCtx);
                }
            })
        ]);

        owner.actions.runAction(creepy);
    }

    onRemove(previousOwner: BaseActor) {
        const graphic = previousOwner.graphics.current;
        if (!(graphic instanceof Raster) || !this.backup) {
            return;
        }

        previousOwner.addTag(INFECTABLE_TAG);

        const {
            color,
            strokeColor,
            lineWidth,
            collisionGroup,
            collisionType,
        } = this.backup;

        graphic.color = color;
        graphic.strokeColor = strokeColor;
        graphic.lineWidth = lineWidth;
        previousOwner.body.group = collisionGroup;
        previousOwner.body.collisionType = collisionType;
        previousOwner.actions.clearActions();
        previousOwner.scale = Vector.One;
        previousOwner.graphics.opacity = 1;

        previousOwner.removeComponent(HealthComponent);
        previousOwner.removeComponent(DropsLootComponent);
    }
}