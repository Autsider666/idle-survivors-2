import { Engine, Keys } from "excalibur";

export enum Direction {
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down',
}

export class DirectionQueue {
    private heldDirections: Direction[] = [];

    get direction(): Direction | null {
        return this.heldDirections[0] ?? null;
    }

    has(direction: Direction): boolean {
        return this.heldDirections.includes(direction);
    }

    add(direction: Direction): void {
        const exists = this.heldDirections.includes(direction);
        if (exists) {
            return;
        }
        this.heldDirections.unshift(direction);
    }

    remove(direction: Direction): void {
        this.heldDirections = this.heldDirections.filter((d) => d !== direction);
    }

    update(engine: Engine): void {
        [
            { key: Keys.Left, dir: Direction.LEFT },
            { key: Keys.A, dir: Direction.LEFT },
            { key: Keys.Right, dir: Direction.RIGHT },
            { key: Keys.D, dir: Direction.RIGHT },
            { key: Keys.Up, dir: Direction.UP },
            { key: Keys.W, dir: Direction.UP },
            { key: Keys.Down, dir: Direction.DOWN },
            { key: Keys.S, dir: Direction.DOWN },
        ].forEach((group) => {
            if (engine.input.keyboard.wasPressed(group.key)) {
                this.add(group.dir);
            }
            if (engine.input.keyboard.wasReleased(group.key)) {
                this.remove(group.dir);
            }
        });
    }
}