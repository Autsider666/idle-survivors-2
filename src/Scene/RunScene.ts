import {Scene, SceneActivationContext, Vector} from "excalibur";
import {WorldMap} from "../Game/WorldGen/WorldMap.ts";
import Player from "../Actor/Player.ts";
import {MonsterSpawnSystem} from "../System/MonsterSpawnSystem.ts";
import PlayerCameraStrategy from "../Utility/PlayerCameraStrategy.ts";
import {Timer} from "../Utility/Timer.ts";

export type RunActivationData = {
    seed?: number;
    playerStart?: Vector;
}

export class RunScene extends Scene {
    public onInitialize() {
        this.world.add(MonsterSpawnSystem);
    }

    public onActivate({data}: SceneActivationContext<RunActivationData>) {
        this.world.clearEntities();

        const worldMap = new WorldMap(data?.seed ?? Date.now());
        this.add(worldMap);

        const startingPos = worldMap.getRandomSafeRegion();

        const player = new Player(data?.playerStart ?? startingPos.pos);
        this.add(player);

        this.camera.addStrategy(new PlayerCameraStrategy(player));

        const timer = new Timer();
        timer.everyTime({seconds: 1},()=>console.log('EveryTime does not seem to repeat, probably because of my own lazy code writing'));

        this.add(timer);
        timer.start();
    }
}