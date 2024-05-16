import { BodyComponent, Engine, Random, TagQuery, Vector } from "excalibur";
import { PlayerTag } from "../Actor/Player";
import { Monster, MonsterTag } from "../Actor/Monster";
import DynamicEventListener from "./DynamicEventListener";

export class MonsterSpawner {
    // private active: boolean = true;
    private random = new Random();
    private distanceFromPlayer: number = 400;
    private readonly monsterQuery: TagQuery<string>;
    private readonly playerQuery: TagQuery<string>;


    constructor(
        private readonly engine: Engine,
        rate: number = 10,
        private readonly maxMonsters: number = 50,
    ) {
        DynamicEventListener.register('#spawn-monster', 'click', () => this.spawnMonster());

        this.monsterQuery = this.engine.currentScene.world.queryTags([MonsterTag]);
        this.playerQuery = this.engine.currentScene.world.queryTags([PlayerTag]);

        this.scheduleNextMonster(rate);
    }

    spawnMonster(): void {
        if (this.monsterQuery.entities.length >= this.maxMonsters) {
            return;
        }

        for (const entity of this.playerQuery.entities) {
            const body = entity.get(BodyComponent);

            const monsterPos = body.pos.clone();

            const dX = this.random.floating(-1, 1);
            const dY = this.random.floating(-1, 1);
            let test = new Vector(dX, dY);
            test = test.normalize();

            monsterPos.x += test.x * this.distanceFromPlayer;
            monsterPos.y += test.y * this.distanceFromPlayer;

            this.engine.currentScene.add(new Monster(monsterPos.x, monsterPos.y))

            return;
        }
    }

    scheduleNextMonster(rate: number): void {
        this.engine.clock.schedule(() => {
            this.spawnMonster();

            this.scheduleNextMonster(rate);
        }, 1000.0 / rate);
    }
}