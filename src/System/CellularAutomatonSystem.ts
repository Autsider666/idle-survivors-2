import {Query, System, SystemType, TagQuery, World} from "excalibur";
import {InfectedComponent} from "../Component/InfectedComponent.ts";
import {PolygonMapTile} from "../Game/WorldGen/PolygonMapTile.ts";
import {INFECTABLE_TAG} from "./InfectionSpawnerSystem.ts";

export class CellularAutomatonSystem extends System {
    systemType: SystemType = SystemType.Draw;

    private readonly interval: number = 500;
    private next: number = 0;

    private infectedQuery: Query<typeof InfectedComponent>;
    private activeTileQuery: TagQuery<typeof INFECTABLE_TAG>;

    // private random: Random = new Random();

    private readonly infectedTiles = new Set<PolygonMapTile>();
    private readonly uninfectedTiles = new Set<PolygonMapTile>();

    // private readonly minimalInfections: number = 20;
    private readonly minNeighborsToLive: number = 2;
    private readonly maxNeighborsToLive: number = 3;
    private readonly neighborsToInfect: number = 3;

    constructor(world: World) {
        super();
        this.infectedQuery = world.query([InfectedComponent]);
        this.infectedQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof PolygonMapTile) {
                this.infectedTiles.add(entity);
            }
        });

        this.infectedQuery.entityRemoved$.subscribe(entity => this.infectedTiles.delete(entity as PolygonMapTile));

        this.activeTileQuery = world.queryTags([INFECTABLE_TAG]);
        this.activeTileQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof PolygonMapTile) {
                this.uninfectedTiles.add(entity);
            }
        });

        this.activeTileQuery.entityRemoved$.subscribe(entity => this.uninfectedTiles.delete(entity as PolygonMapTile));
    }

    update(elapsedMs: number): void {
        this.next -= elapsedMs;
        if (this.next > 0) {
            return;
        }

        this.next = this.interval;
        const killList = new Set<PolygonMapTile>;
        for (const cell of this.infectedTiles) {
            // 1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
            // 2. Any live cell with two or three live neighbors lives on to the next generation.
            // 3. Any live cell with more than three live neighbors dies, as if by overpopulation.
            const livingNeighbourCount = cell.getNeighbors().filter(neighbor => neighbor.has(InfectedComponent)).length;
            if (livingNeighbourCount < this.minNeighborsToLive || livingNeighbourCount > this.maxNeighborsToLive) {
                killList.add(cell);
            }
        }

        // 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        const infectList = new Set<PolygonMapTile>;
        for (const cell of this.uninfectedTiles) {
            if (cell.has(InfectedComponent)) {
                continue;
            }

            const infectedNeighbors = cell.getNeighbors().filter(neighbor => neighbor.has(InfectedComponent));
            if (infectedNeighbors.length === this.neighborsToInfect) {
                infectList.add(cell);
            }
        }

        // console.log({
        //     infected: this.infectedTiles.size,
        //     uninfected: this.uninfectedTiles.size,
        //     died: killList.size,
        //     new: infectList.size,
        // });

        killList.forEach(cell => {
            cell.removeComponent(InfectedComponent);
        });
        infectList.forEach(cell => {
            cell.addComponent(new InfectedComponent());
        });
    }
}