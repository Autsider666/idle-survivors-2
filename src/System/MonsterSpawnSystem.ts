import {BodyComponent, Engine, Random, Scene, System, SystemType, TagQuery, Vector, World} from "excalibur";
import {Monster, MonsterTag} from "../Actor/Monster";
import {PlayerTag} from "../Actor/Player";
import DynamicEventListener from "../Utility/DynamicEventListener";
import {ActorPool} from "../Utility/ActorPool.ts";
import {SPAWN_DISTANCE, SPAWN_MAX_MONSTERS, SPAWN_BASE_RATE} from "../config.ts";

const pool = new ActorPool<Monster>(() => new Monster());

export const MONSTER_SPAWN_TAG = 'MONSTER_SPAWN';

export class MonsterSpawnSystem extends System {
    private readonly maxMonsters: number = SPAWN_MAX_MONSTERS;
    private readonly spawnRate: number = SPAWN_BASE_RATE;
    private readonly distanceFromPlayer: number = SPAWN_DISTANCE;

    private random: Random;
    private nextMonsterIn: number = 0;
    private lastMonsterSpawn:Vector = Vector.Zero;
    private engine?: Engine;

    systemType: SystemType = SystemType.Update;

    private monsterQuery: TagQuery<string>;
    private playerQuery: TagQuery<string>;
    private spawnLocationQuery: TagQuery<string>;

    constructor(world: World) {
        super();

        this.random = new Random();
        this.monsterQuery = world.queryTags([MonsterTag]);
        this.playerQuery = world.queryTags([PlayerTag]);
        this.spawnLocationQuery = world.queryTags([MONSTER_SPAWN_TAG]);
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

        // const locations = new Set<Vector>(this.getSpawnLocations());
        const locations = this.getSpawnLocations();
        if (locations.length === 0) {
            return;
        }

        const location = this.random.pickOne(this.getSpawnLocations());

        this.lastMonsterSpawn = location;

        this.nextMonsterIn = 1000.0 / this.spawnRate;

        const monster = pool.requestActor();
        monster.pos = location;

        this.engine?.currentScene.add(monster);
    }

    private getSpawnLocations(): Vector[] {
        const playerEntity = this.random.pickSet(this.playerQuery.entities, 1)[0];
        if (playerEntity === undefined) {
            return [];
        }

        const playerLocation = playerEntity.get(BodyComponent).pos;

        return this.spawnLocationQuery.entities
            .map(entity => entity.get(BodyComponent)?.pos.clone())
            .filter(location => {
                if (location === undefined) {
                    return false;
                }

                return playerLocation.distance(location) > this.distanceFromPlayer && this.lastMonsterSpawn.distance(location) > 300;
            });
    }
}