import {BaseComponent} from "../BaseComponent.ts";
import {Animation} from "excalibur";
import {BaseActor} from "../../Actor/BaseActor.ts";
import {SlowedComponent} from "../SlowedComponent.ts";

type Direction = 'idle' | 'left' | 'right' | 'up' | 'down';

type Props = {
    idle: Animation,
    left?: Animation,
    right?: Animation,
    up?: Animation,
    down?: Animation,
}

export class DirectionalAnimationComponent extends BaseComponent {
    private currentDirection: Direction = 'idle';
    private readonly idle: Animation;
    private readonly left?: Animation;
    private readonly right?: Animation;
    private readonly up?: Animation;
    private readonly down?: Animation;

    constructor({idle, left, right, up, down}: Props) {
        super();

        this.idle = idle;
        this.left = left;
        this.right = right;
        this.up = up;
        this.down = down;
    }

    onAdd(owner: BaseActor) {
        owner.on<'postupdate'>('postupdate', () => {
            const dX = owner.vel.x;
            const dY = owner.vel.y;
            if (Math.abs(dX) > Math.abs(dY)) {
                this.setAnimation(dX > 0 ? 'right' : 'left');
            } else {
                this.setAnimation(dY > 0 ? 'down' : 'up');
            }

            const animation = this.owner?.graphics.current as Animation;
            animation.speed = owner.has(SlowedComponent) ? 0.5:1;
        });
    }

    private setAnimation(direction: Direction): void {
        if (direction === this.currentDirection) {
            return;
        }

        const newAnimation = this[direction] ?? this['idle'];
        this.owner?.graphics.use(newAnimation);

        this.currentDirection = direction;
    }
}