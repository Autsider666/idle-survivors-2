import {Query, Random, System, SystemType, World} from "excalibur";
import {LiveCellComponent} from "../Component/LiveCellComponent.ts";
import {State, UnstableComponent} from "../Component/UnstableComponent.ts";
import {PolygonMapTile} from "../Game/WorldGen/PolygonMapTile.ts";

export class CellularAutomatonSystem extends System {
    systemType: SystemType = SystemType.Draw;

    private readonly interval: number = 2000;
    private next: number = 0;

    private liveCellQuery: Query<typeof LiveCellComponent>;
    private activeTileQuery: Query<typeof UnstableComponent>;

    private random: Random = new Random();

    private readonly infectedTiles = new Set<PolygonMapTile>();
    private readonly uninfectedTiles = new Set<PolygonMapTile>();

    private readonly minimalInfections: number = 20;
    private readonly minNeighborsToLive: number = 2;
    private readonly maxNeighborsToLive: number = 3;
    private readonly neighborsToInfect: number = 3;

    constructor(world: World) {
        super();
        this.liveCellQuery = world.query([LiveCellComponent]);
        this.liveCellQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof PolygonMapTile) {
                this.infectedTiles.add(entity);
            }
        });

        this.liveCellQuery.entityRemoved$.subscribe(entity => this.infectedTiles.delete(entity as PolygonMapTile));

        this.activeTileQuery = world.query([UnstableComponent]);
        this.activeTileQuery.entityAdded$.subscribe(entity => {
            if (entity instanceof PolygonMapTile && !entity.has(LiveCellComponent)) {
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
        if (this.liveCellQuery.entities.length < this.minimalInfections) {
            const validTiles = this.activeTileQuery.entities
                .filter(tile => !tile.has(LiveCellComponent)
                    && tile.get(UnstableComponent).currentState === State.Stable);
            const priorityTiles = validTiles.filter(tile => tile.scene === undefined);
            this.random.pickSet(
                validTiles,
                Math.min(this.minimalInfections, priorityTiles.length))
                .forEach(tile => tile.addComponent(new LiveCellComponent()));

            this.random.pickSet(
                validTiles,
                Math.min(this.minimalInfections - this.liveCellQuery.entities.length, Math.max(0, validTiles.length)))
                .forEach(tile => tile.addComponent(new LiveCellComponent()));
        }

        const killList = new Set<PolygonMapTile>;
        for (const cell of this.infectedTiles) {
            // 1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
            // 2. Any live cell with two or three live neighbors lives on to the next generation.
            // 3. Any live cell with more than three live neighbors dies, as if by overpopulation.
            const neighbors = cell.getNeighbors().filter(neighbor => neighbor.has(LiveCellComponent));
            if (neighbors.length < this.minNeighborsToLive || neighbors.length > this.maxNeighborsToLive) {
                // cell.removeComponent(LiveCellComponent);
                killList.add(cell);
            }
        }

        // 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        const infectList = new Set<PolygonMapTile>;
        for (const cell of this.uninfectedTiles) {
            const infectedNeighbors = cell.getNeighbors().filter(neighbor => neighbor.has(LiveCellComponent));
            if (infectedNeighbors.length === this.neighborsToInfect) {
                cell.addComponent(new LiveCellComponent());
                infectList.add(cell);
            }
        }

        console.log({
            infected: this.infectedTiles.size,
            uninfected: this.uninfectedTiles.size,
            died: killList.size,
            new: infectList.size,
        });

        killList.forEach(cell => cell.removeComponent(LiveCellComponent));
        infectList.forEach(cell => cell.addComponent(new LiveCellComponent()));
    }

}