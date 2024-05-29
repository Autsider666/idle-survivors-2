import {BaseActor} from "../../../Actor/BaseActor.ts";
import {BoundingBox, Engine, Vector} from "excalibur";
import {ActorRenderManager} from "../../../Utility/ActorRenderManager.ts";
import {LayeredCell} from "./LayeredCell.ts";
import Array2D from "../../../Utility/Array2D.ts";
import {CoordinateBasedSeedGenerator} from "../../../Utility/CoordinateBasedSeedGenerator.ts";
import {RandomPointLayer} from "./Layer/RandomPointLayer.ts";
import {PolygonData, PolygonLayer} from "./Layer/PolygonLayer.ts";
import {MapRegion} from "../../../Actor/MapRegion.ts";

export class LayeredWorld extends BaseActor {
    private readonly manager: ActorRenderManager;
    private currentGridPos: Vector = new Vector(Infinity, Infinity);
    private readonly cells = new Array2D<LayeredCell>();
    private readonly seedGenerator: CoordinateBasedSeedGenerator;

    private readonly pointLayer:RandomPointLayer;
    private readonly polygonLayer:PolygonLayer;
    private readonly polygons = new Set<PolygonData>();


    constructor(
        private readonly seed: number,
        private readonly cellHeight: number = 1000,
        private readonly cellWidth: number = 1000,
        private readonly pointsPerCell: number = 25,
        private readonly readyCellRadius: number = 2,
        private readonly maxNewPerUpdate: number = 5,
    ) {
        super();

        this.manager = new ActorRenderManager(1000);

        this.seedGenerator = new CoordinateBasedSeedGenerator(this.seed);

        // this.moveTo(Vector.Zero, Infinity);

        this.pointLayer = new RandomPointLayer(this.seed, this.cellWidth, this.cellHeight, 50);
        this.polygonLayer = new PolygonLayer(this.cellWidth, this.cellHeight, this.pointLayer);
    }

    onPostUpdate(engine: Engine) {
        this.manager.check(engine, 200); //TODO move to listener?
    }

    onInitialize(engine: Engine) {
        this.manager.setScene(engine.currentScene);
    }

    moveTo(location: Vector, maxCreates: number = this.maxNewPerUpdate): void {
        const gridX = Math.floor(location.x / this.cellWidth);
        const gridY = Math.floor(location.y / this.cellWidth);

        // if (this.currentGridPos.x === gridX && this.currentGridPos.y === gridY) {
        //     return;
        // }

        if (this.currentGridPos.x === Math.floor(location.x) && this.currentGridPos.y === Math.floor(location.y)) {
            return;
        }
        // console.log(pointLayer.getData(BoundingBox.fromDimension(
        //     50,
        //     200,
        //     Vector.Zero,
        //     new Vector(100, 100),
        //     // new Vector(gridX * this.cellWidth, gridY * this.cellHeight),
        // )))
        const polygons = this.polygonLayer.getData(BoundingBox.fromDimension(
            this.cellWidth,
            this.cellHeight,
            Vector.Half,
            location,
            // new Vector(gridX * this.cellWidth, gridY * this.cellHeight),
        ));
        // polygons.pop();
        // this.manager.add(new MapRegion({
        //     ...polygons.pop(),
        //     elevation: 0.6,
        //     moisture: 0.5,
        // }))

        polygons.forEach(polygon => {
            if (this.polygons.has(polygon)) {
                return;
            }

            this.polygons.add(polygon)
            this.manager.add(new MapRegion({
                ...polygon,
                elevation: Math.random(),
                moisture: 0.5,
            }));
        })

        this.currentGridPos.x = Math.floor(location.x);
        this.currentGridPos.y = Math.floor(location.y);
        return;

        const start = performance.now();

        const expectedCellRange = this.readyCellRadius + LayeredCell.maxLevel;

        const newCells = new Array2D<LayeredCell>();
        for (let x = gridX - expectedCellRange; x <= gridX + expectedCellRange; x++) {
            for (let y = gridY - expectedCellRange; y <= gridY + expectedCellRange; y++) {
                if (this.cells.has(x, y) || maxCreates <= 0) {
                    continue;
                }

                const currentCell = this.generateCell(x, y);
                this.cells.set(x, y, currentCell);
                newCells.set(x, y, currentCell);
                // this.manager.add(currentCell);
                --maxCreates;
            }
        }

        if (maxCreates > 0) {
            this.currentGridPos.x = gridX;
            this.currentGridPos.y = gridY;
        }

        const createNew = performance.now();

        // Introduce new cells to neighbors
        for (const [pos, newCell] of newCells.entries()) {
            for (let x = pos.x - 1; x <= pos.x + 1; x++) {
                for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                    if (pos.x === x && pos.y === y) {
                        continue;
                    }

                    const neighbor = this.cells.get(x, y);
                    if (neighbor !== undefined) {
                        newCell.addNeighbor(neighbor);
                    }
                }
            }
        }
        const introducingNeighbors = performance.now();

        // Ready for lvl 1
        for (const [pos, cell] of this.cells.entries()) {
            const distance = Math.max(Math.abs(gridX - pos.x), Math.abs(gridY - pos.y));
            const expectedLevel = LayeredCell.getLevelFromDistance(distance, this.readyCellRadius);
            if (expectedLevel < 1 || cell.level >= 1) {
                continue;
            }

            cell.readyLevel1();
        }
        const level1 = performance.now();

        // Ready for lvl 2
        for (const [pos, cell] of this.cells.entries()) {
            const distance = Math.max(Math.abs(gridX - pos.x), Math.abs(gridY - pos.y));
            const expectedLevel = LayeredCell.getLevelFromDistance(distance, this.readyCellRadius);
            if (expectedLevel < 2 || cell.level >= 2) {
                continue;
            }

            cell.readyLevel2();
        }
        const level2 = performance.now();

        // Ready for lvl 3
        for (const [pos, cell] of this.cells.entries()) {
            const distance = Math.max(Math.abs(gridX - pos.x), Math.abs(gridY - pos.y));
            const expectedLevel = LayeredCell.getLevelFromDistance(distance, this.readyCellRadius);
            if (expectedLevel < 3 || cell.level >= 3) {
                continue;
            }

            cell.readyLevel3();
        }
        const level3 = performance.now();

        // Ready for lvl 4
        for (const [pos, cell] of this.cells.entries()) {
            const distance = Math.max(Math.abs(gridX - pos.x), Math.abs(gridY - pos.y));
            const expectedLevel = LayeredCell.getLevelFromDistance(distance, this.readyCellRadius);
            if (expectedLevel < 4 || cell.level >= 4 || maxCreates < 0) {
                continue;
            }

            cell.readyLevel4();

            maxCreates--;
        }

        const end = performance.now();
        console.debug(`Entering ${gridX},${gridY}`, {
            total: end - start,
            new: createNew - start,
            neighbors: introducingNeighbors - createNew,
            level1: level1 - introducingNeighbors,
            level2: level2 - level1,
            level3: level3 - level2,
            level4: end - level3,

        });
    }

    private generateCell(gridX: number, gridY: number): LayeredCell {
        return new LayeredCell(
            this.seedGenerator.getSeed(gridX, gridY),
            BoundingBox.fromDimension(
                this.cellWidth,
                this.cellHeight,
                Vector.Zero,
                new Vector(gridX * this.cellWidth, gridY * this.cellHeight),
            ),
            this.pointsPerCell,
            this.manager
        );
    }
}