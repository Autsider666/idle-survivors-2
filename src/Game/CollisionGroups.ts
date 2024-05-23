import { CollisionGroup as EXCollisionGroup } from "excalibur";

enum Category {
    Ground = 0b0000_0001, // prettier-ignore
    Player = 0b0000_0010, // prettier-ignore
    Enemy = 0b0000_0100, // prettier-ignore
    Item = 0b0000_1000, // prettier-ignore
    Weapon = 0b0001_0000, // prettier-ignore
    Projectile = 0b0010_0000, // prettier-ignore
    Hazard = 0b0100_0000, // prettier-ignore
    Climbable = 0b1000_0000, // prettier-ignore
}

function collideWith(...categories: Category[]): number {
    return categories.reduce((acc, cat) => acc | cat, 0);
}

export const CollisionGroup: Record<string, EXCollisionGroup> = {
    Ground: new EXCollisionGroup(
        'ground',
        Category.Ground,
        collideWith(Category.Player, Category.Enemy)
    ),
    Player: new EXCollisionGroup(
        'player',
        Category.Player,
        collideWith(
            Category.Ground,
            Category.Enemy,
            Category.Item,
            Category.Hazard,
            Category.Climbable
        )
    ),
    Enemy: new EXCollisionGroup(
        'enemy',
        Category.Enemy,
        collideWith(Category.Player, Category.Weapon, Category.Ground, Category.Enemy)
    ),
    Hazard: new EXCollisionGroup(
        'hazard',
        Category.Hazard,
        collideWith(Category.Player, Category.Enemy)
    ),
    Item: new EXCollisionGroup(
        'item',
        Category.Item,
        collideWith(Category.Player)
    ),
    Weapon: new EXCollisionGroup(
        'weapon',
        Category.Weapon,
        collideWith(Category.Enemy)
    ),
    Projectile: new EXCollisionGroup(
        'projectile',
        Category.Weapon,
        collideWith(Category.Enemy)
    ),
    Climbable: new EXCollisionGroup(
        'climbable',
        Category.Climbable,
        collideWith(Category.Player)
    ),
};