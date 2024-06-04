import {BoundingBox, Query, Random, System, SystemType, TagQuery, Vector, World} from "excalibur";
import {InfectedComponent} from "../Component/InfectedComponent.ts";
import {PolygonMapTile} from "../Game/WorldGen/PolygonMapTile.ts";
import Array2D from "../Utility/Array2D.ts";
import {GridComponent} from "../Component/GridComponent.ts";
import {Pattern} from "../CellularAutomata/Pattern.ts";
import Player, {PlayerTag} from "../Actor/Player.ts";

const blockPattern = new Pattern(
    [
        new Vector(0, 0), new Vector(1, 0),
        new Vector(1, 0), new Vector(1, 1),
    ],
);
const blinkerPattern = new Pattern(
    [
        new Vector(0, 1), new Vector(1, 1), new Vector(2, 1),
    ],
    [new Vector(0, 0), new Vector(3, 3)]
);
const beaconPattern = new Pattern(
    [
        new Vector(0, 0), new Vector(1, 0),
        new Vector(0, 1), new Vector(1, 1),
        new Vector(2, 2), new Vector(3, 2),
        new Vector(2, 3), new Vector(3, 3),
    ],
);
const gliderPattern = new Pattern(
    [
        new Vector(0, 0),
        new Vector(1, 1), new Vector(2, 1),
        new Vector(0, 2), new Vector(1, 2),
    ],
    [],
    Vector.One,
);
const pulsarPattern = new Pattern(
    [
        new Vector(2, 0), new Vector(3, 0), new Vector(4, 0),
        new Vector(8, 0), new Vector(9, 0), new Vector(10, 0),
        new Vector(0, 2), new Vector(5, 2), new Vector(7, 2), new Vector(12, 2),
        new Vector(0, 3), new Vector(5, 3), new Vector(7, 3), new Vector(12, 3),
        new Vector(0, 4), new Vector(5, 4), new Vector(7, 4), new Vector(12, 4),
        new Vector(2, 5), new Vector(3, 5), new Vector(4, 5),
        new Vector(8, 5), new Vector(9, 5), new Vector(10, 5),

        new Vector(2, 7), new Vector(3, 7), new Vector(4, 7),
        new Vector(8, 7), new Vector(9, 7), new Vector(10, 7),
        new Vector(0, 8), new Vector(5, 8), new Vector(7, 8), new Vector(12, 8),
        new Vector(0, 9), new Vector(5, 9), new Vector(7, 9), new Vector(12, 9),
        new Vector(0, 10), new Vector(5, 10), new Vector(7, 10), new Vector(12, 10),
        new Vector(2, 12), new Vector(3, 12), new Vector(4, 12),
        new Vector(8, 12), new Vector(9, 12), new Vector(10, 12),
    ],
    [new Vector(-1, -1), new Vector(13, 13)]
);

const patterns = [
    blockPattern,
    blinkerPattern,
    beaconPattern,
    gliderPattern,
    pulsarPattern,
];

export const INFECTABLE_TAG = 'infectable';

export class InfectionSpawnerSystem extends System {
    systemType: SystemType = SystemType.Draw;

    private readonly interval: number = 500;
    private next: number = 500;

    private infectedQuery: Query<typeof InfectedComponent | typeof GridComponent>;
    private infectableQuery: TagQuery<string>;
    private playerQuery: TagQuery<string>;

    private random: Random = new Random();

    private readonly infectedTiles = new Set<PolygonMapTile>();
    private readonly uninfectedTiles = new Set<PolygonMapTile>();

    private readonly minimalInfections: number = 15;

    private readonly worldBounds: BoundingBox = new BoundingBox(0, 0, 0, 0);
    private readonly infectableMap = new Array2D<PolygonMapTile>();

    private player?: Player;

    constructor(world: World) {
        super();
        this.infectedQuery = world.query([InfectedComponent, GridComponent]);
        this.infectedQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof PolygonMapTile) {
                this.infectedTiles.add(entity);
            }
        });

        this.infectedQuery.entityRemoved$.subscribe(entity => {
            this.infectedTiles.delete(entity as PolygonMapTile);
        });

        this.infectableQuery = world.queryTags([INFECTABLE_TAG]);
        this.infectableQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof PolygonMapTile && !entity.has(InfectedComponent)) {
                this.uninfectedTiles.add(entity);
                const {point, x, y} = entity.get(GridComponent);
                this.infectableMap.set(x, y, entity);
                if (!this.worldBounds.contains(point)) {
                    this.worldBounds.left = Math.min(this.worldBounds.left, x);
                    this.worldBounds.right = Math.max(this.worldBounds.right, x);
                    this.worldBounds.top = Math.min(this.worldBounds.top, y);
                    this.worldBounds.bottom = Math.max(this.worldBounds.bottom, y);
                }
            }
        });

        this.infectableQuery.entityRemoved$.subscribe(entity => {
            this.uninfectedTiles.delete(entity as PolygonMapTile);
            const grid = entity.get(GridComponent);
            this.infectableMap.delete(grid.x, grid.y);
        });
        this.playerQuery = world.queryTags([PlayerTag]);
        this.playerQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof Player) {
                this.player = entity;
            }
        });
    }

    update(elapsedMs: number): void {
        this.next -= elapsedMs;
        if (this.next > 0) {
            return;
        }

        this.next = this.interval;
        if (this.infectedTiles.size >= this.minimalInfections) {
            return;
        }

        let pattern = this.random.pickOne(patterns);
        const playerPos = this.player?.pos;

        const validTiles = Array.from(this.uninfectedTiles).filter(tile => {
            const point = tile.get(GridComponent).point;
            const translation = pattern.bounds.translate(point);
            return this.worldBounds.contains(translation);
        });

        if (validTiles.length === 0) {
            console.log('No valid tiles found for ', pattern);
            return;
        }

        let tries = 10;
        while (tries > 0) {
            tries--;
            const randomTile = this.random.pickOne(validTiles);
            if (pattern.velocity && playerPos) {
                const targetAngle = playerPos.sub(randomTile.pos).toAngle();
                const patternAngle = pattern.velocity.toAngle();

                let rotation = 0;
                while (Math.abs(targetAngle - (patternAngle + rotation)) > Math.PI / 4) {
                    rotation += Math.PI / 2;

                    if (rotation > 2 * Math.PI) {
                        rotation = 0;
                        break;
                    }
                }


                if (rotation > 0) {
                    pattern = pattern.rotate(rotation);
                    const divideToDegree = (Math.PI * 2) / 360;
                    console.log('rotated by', rotation / divideToDegree);

                    // console.log({
                    //     pattern: pattern.velocity,
                    //     patternAngle:(pattern.velocity?.toAngle() ?? 0)/divideToDegree,
                    //     test: (new Vector(0,-1)).toAngle()/divideToDegree,
                    //     playerPos,
                    //     tile:randomTile.pos,
                    //     directionToTarget:playerPos.sub(randomTile.pos),
                    //     angleToPlayer: targetAngle/divideToDegree,
                    //     angleOfPattern: patternAngle/divideToDegree,
                    //     addedRotation: rotation/divideToDegree,
                    //     remainingDifference:Math.abs(targetAngle-(patternAngle+rotation))/divideToDegree,
                    //     resultingAngle:(patternAngle+rotation)/divideToDegree,
                    // });
                }
            }

            const tilesToInfect: PolygonMapTile[] = [];
            const gridPos = randomTile.get(GridComponent);
            for (const point of pattern.points) {
                const x = gridPos.x + point.x;
                const y = gridPos.y + point.y;
                const tile = this.infectableMap.get(x, y);
                if (!tile) {
                    continue;
                }

                tilesToInfect.push(tile);
            }

            if (tilesToInfect.length !== pattern.points.length) {
                continue;
            }

            tilesToInfect.forEach(tile => tile.addComponent(new InfectedComponent()));

            break;
        }
    }

}