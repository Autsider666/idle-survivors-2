import {BaseComponent} from "./BaseComponent.ts";
import {BaseActor} from "../Actor/BaseActor.ts";
import {Experience} from "../Actor/Experience.ts";
import {WEAPONS} from "../config.ts";

// const upgrades: Record<number, BaseActor> = {
//     2: new Weapon(50, Color.White, 10),
//     3: new OrbitingWeapon({ projectiles: 4, range: 150, rps: 0.6, damage: 1 }),
//     4: new OrbitingWeapon({ projectiles: 10, range: 200, rps: 0.1, clockwise: false }),
// };

export class LevelComponent extends BaseComponent {
    private currentExperience: number = 0;
    private currentLevel: number = 1;

    onAdd(owner: BaseActor) {
        this.addExperience(0);

        owner.on<'collisionstart'>('collisionstart', ({other}) => {
            if (!(other instanceof Experience)) {
                return;
            }

            this.addExperience(other.value);

            other.kill();
        });
    }

    public addExperience(value: number): void {
        this.currentExperience += Math.max(value, 0);

        if (this.currentExperience >= this.experienceForNextLevel) {
            this.currentExperience %= this.experienceForNextLevel;
            this.currentLevel++;

            this.handleLevelUp();

            const levelElement = document.getElementById('currentLevel');
            if (levelElement === null) {
                throw new Error('No level element found!');
            }

            levelElement.innerText = this.currentLevel.toString();
            document.getElementById('xp')?.setAttribute('max', this.experienceTillNextLevel.toString());

            this.owner?.emit<'level-up'>('level-up', {level: this.currentLevel});
        }

        document.getElementById('xp')?.setAttribute('value', this.currentExperience.toString());
    }

    get experienceForNextLevel(): number {
        return Math.pow(this.currentLevel, 2) * 25;
    }

    get experienceTillNextLevel(): number {
        return this.experienceForNextLevel - this.currentExperience;
    }

    private handleLevelUp(): void {
        for (const data of Object.values(WEAPONS)) {
            if (data.minLevel !== this.currentLevel) {
                continue;
            }

            this.owner?.addChild(new data.type(data));

        }
    }
}