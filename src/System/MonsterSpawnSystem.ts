import {BodyComponent, Engine, Random, Scene, System, SystemType, TagQuery, Vector, World} from "excalibur";
import {Monster, MonsterTag} from "../Actor/Monster";
import {PlayerTag} from "../Actor/Player";
import DynamicEventListener from "../Utility/DynamicEventListener";
import {ActorPool} from "../Utility/ActorPool.ts";
import {SPAWN_DISTANCE, SPAWN_MAX_MONSTERS, SPAWN_BASE_RATE} from "../config.ts";

const pool = new ActorPool<Monster>(() => new Monster());

export class MonsterSpawnSystem extends System {
    private readonly maxMonsters: number = SPAWN_MAX_MONSTERS;
    private readonly spawnRate: number = SPAWN_BASE_RATE;
    private readonly distanceFromPlayer: number = SPAWN_DISTANCE;

    private random: Random;
    private nextMonsterIn: number = 0;
    private engine?: Engine;

    systemType: SystemType = SystemType.Update;

    private monsterQuery: TagQuery<string>;
    private playerQuery: TagQuery<string>;

    constructor(world: World) {
        super();

        this.random = new Random();
        this.monsterQuery = world.queryTags([MonsterTag]);
        this.playerQuery = world.queryTags([PlayerTag]);
    }

    initialize(_world: World, scene: Scene<unknown>): void {
        this.engine = scene.engine;

        DynamicEventListener.register('#spawn-monster', 'click', () => this.spawnMonster());
    }

    update(elapsedMs: number): void {
        const monsterCount = this.monsterQuery.entities.filter(monster => !monster.isKilled()).length;
        if (monsterCount >= this.maxMonsters) {
            return;
        }

        this.nextMonsterIn -= elapsedMs;
        if (this.nextMonsterIn > 0) {
            return;
        }

        this.spawnMonster();
    }

    private spawnMonster(): void {
        if (this.playerQuery.entities.length === 0) {
            return;
        }

        const playerEntity = this.random.pickSet(this.playerQuery.entities, 1)[0];
        if (playerEntity === undefined) {
            return;
        }

        this.nextMonsterIn = 1000.0 / this.spawnRate;

        const monsterPos = playerEntity.get(BodyComponent).pos.clone();

        const dX = this.random.floating(-1, 1);
        const dY = this.random.floating(-1, 1);
        let randomDirection = new Vector(dX, dY);
        randomDirection = randomDirection.normalize();

        monsterPos.x += randomDirection.x * this.distanceFromPlayer;
        monsterPos.y += randomDirection.y * this.distanceFromPlayer;

        const monster = pool.requestActor();
        monster.pos = monsterPos;

        this.engine?.currentScene.add(monster);
    }
}