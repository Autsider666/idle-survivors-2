import {BoundingBox, Color, Polygon, Rectangle, Vector} from "excalibur";
import Randomizer from "../Randomizer.ts";
import {BaseActor} from "../../../Actor/BaseActor.ts";
import {MapGenFunction} from "../MapGenFunction.ts";

// Level 0 = random points
// Level 1 = Poisson points
// Level 2 = Vertices
// Level 3 = Metadata (moisture, elevation)
// Level 4 = child

type Level2Region = {
    vertices: Vector[]
}

type Level3Region = {
    pos: Vector,
    elevation: number,
    moisture: number,
} & Level2Region;

type CellData = {
    0: Vector[],
    1: Vector[],
    2: Level2Region[],
    3: Level3Region[],
    4: boolean,
}

export class LayeredCell extends BaseActor { //TODO Sure we want this to be BaseActor? Maybe create a "getTestActor()"?
    static maxLevel: number = 4;
    private currentLevel: number = 0;
    private readonly neighbors: Set<LayeredCell>;
    private readonly randomizer: Randomizer;
    // private randomPoints?: Vector[];
    // private poissonPoints?: Vector[];
    // private vertices?: Vector[];
    private readonly seeds: Readonly<{
        0: number,
        1: number,
        2: number,
        3: number,
    }>;
    private readonly metadata: CellData;
    private readonly coordinateOffset: Vector;

    constructor(
        private readonly seed: number,
        private readonly area: BoundingBox,
        startingPoints: number = 3,
        initialNeighbors: LayeredCell[] = []
    ) {
        super({
            pos: area.center,
            z: -5,
        });

        const grid = this.getGridPos();
        this.name = `Grid ${grid.x},${grid.y}`;

        this.coordinateOffset = new Vector(-area.width / 2, -area.height / 2);

        this.neighbors = new Set<LayeredCell>(initialNeighbors);

        this.seeds = {
            0: Number.parseInt(seed.toString() + "0"),
            1: Number.parseInt(seed.toString() + "1"),
            2: Number.parseInt(seed.toString() + "2"),
            3: Number.parseInt(seed.toString() + "3"),
        };

        const randomizer = new Randomizer(this.seeds["0"]);
        const randomPoints: Vector[] = [];
        while (randomPoints.length < startingPoints) {
            const point = new Vector(
                randomizer.getInt(0, area.width),
                randomizer.getInt(0, area.height),
            );
            randomPoints.push(point);
        }

        this.metadata = {
            0: randomPoints,
            1: [],
            2: [],
            3: [],
            4: false,
        };

        // this.renderPoints(randomPoints, Color.DarkGray);

        this.graphics.use(new Rectangle({
            height: area.height,
            width: area.width,
            color: Color.Transparent,
            strokeColor: Color.DarkGray,
            lineWidth: 1,
        }));

        // this.addChild(new Label({
        //     text: `${this.area.left / this.area.width},${this.area.top / this.area.height}`,// - ${this.seed}`,
        //     pos: this.translateCoordinatesForRendering(Vector.Zero),
        //     radius: 2,
        //     color: Color.Gray,
        //     z: -1,
        // }));
    }

    public translateCoordinatesForRendering(point: Vector): Vector {
        return point.add(this.coordinateOffset);
    }

    public translateCoordinatesToGlobal(point: Vector): Vector {
        return point.add(this.area.topLeft);
    }

    public translateCoordinatesToLocal(point: Vector): Vector {
        return point.sub(this.area.topLeft);
    }

    private renderPoints(points: Vector[], color: Color): void {
        for (const point of points) {
            this.addChild(new BaseActor({
                z: -1,
                pos: this.translateCoordinatesForRendering(point),
                radius: 2,
                color,
            }));

            // this.addChild(new Label({
            //     text: `${this.area.left/this.area.width},${this.area.top/this.area.height}`,
            //     pos:  this.translateGlobalCoordinates(point),
            //     radius: 2,
            //     color: Color.Gray,
            // }));
        }
    }

    get level(): number {
        return this.currentLevel;
    }

    public addNeighbor(neighbor: LayeredCell): void {
        if (this.neighbors.has(neighbor)) {
            return;
        }

        if (this.neighbors.size === 8) {
            throw new Error('Cell already has 8 neighbors'); //TODO convert to warning after it's all ready
        }

        this.neighbors.add(neighbor);

        neighbor.addNeighbor(this);
    }

    readyLevel1(): void {
        if (this.metadata["1"].length > 0) {
            return;
        }

        this.checkLevelNeighbors(0);

        this.metadata["1"] = this.metadata["0"];

        this.currentLevel = 1;

        // this.renderPoints(this.metadata["0"], Color.Yellow);
    }

    readyLevel2(): void {
        if (this.metadata["2"].length > 0) {
            return;
        }

        this.checkLevelNeighbors(1);

        const globalPoints = [];
        const points = this.metadata["1"];
        if (points === undefined) {
            throw new Error('no points yet mate?');
        }

        for (const point of points) {
            globalPoints.push(this.translateCoordinatesToGlobal(point));
        }

        for (const neighbor of this.neighbors) {
            neighbor.readyLevel1();
            const neighborPoints = neighbor.metadata["1"];
            if (neighborPoints === undefined) {
                throw new Error('No lvl 1 data yet?');
            }

            for (const point of neighborPoints) {
                globalPoints.push(neighbor.translateCoordinatesToGlobal(point));
            }
        }

        for (const globalVertices of MapGenFunction.calculateVertices(globalPoints)) {
            if (globalVertices.length < 4) {
                continue;
            }

            const localVertices = [];
            let hasLocalVertex = false;
            for (const globalVertex of globalVertices) {
                const localVertex = this.translateCoordinatesToLocal(globalVertex);
                if (localVertex.x >= 0
                    && localVertex.y >= 0
                    && localVertex.x <= this.area.width
                    && localVertex.y <= this.area.height) {
                    hasLocalVertex = true;
                }

                localVertices.push(localVertex);
            }

            if (!hasLocalVertex) {
                continue;
            }

            this.metadata['2'].push({
                vertices: localVertices,
            });
        }

        this.currentLevel = 2;
    }

    readyLevel3(): void {
        if (this.metadata["3"].length > 0) {
            return;
        }

        this.checkLevelNeighbors(2);

        for (const regionData: Level3Region of this.metadata["2"]) {
            regionData.pos = this.translateCoordinatesForRendering(MapGenFunction.calculateAnchor(regionData.vertices));
            regionData.elevation = 0;
            regionData.moisture = 0;
            this.metadata["3"].push(regionData);
        }

        this.currentLevel = 3;
    }

    readyLevel4(): void {
        if (this.metadata["4"]) {
            return;
        }

        this.checkLevelNeighbors(3);

        let i = 0;
        for (const regionData: Level3Region of this.metadata["3"]) {
            const poly = new BaseActor(regionData);
            poly.z = -1;
            poly.graphics.use(new Polygon({
                points: regionData.vertices,
                color: Color.Transparent,
                strokeColor:Color.ExcaliburBlue,
                lineWidth: 1
            }));

            this.addChild(poly);

            // this.addChild(new Label({
            //     pos: regionData.pos,
            //     text: i.toString(),
            //     color: Color.White,
            //     scale: new Vector(1,1)
            // }))

            i++;

            // this.addChild(new MapRegion(
            //     regionData
            // ));
        }

        this.metadata['4'] = true;

        this.currentLevel = 4;
    }

    public getGridPos(): Vector {
        return new Vector(this.area.left / this.area.width, this.area.top / this.area.height);
    }

    private checkLevelNeighbors(minLevel: number): void {
        this.neighbors.forEach(neighbor => {
            if (neighbor.level < minLevel) {
                throw new Error('Not all neighbors are level ' + minLevel);
            }
        });
    }

    static getLevelFromDistance(distance: number, readyCellRadius: number = 0): number {
        return LayeredCell.maxLevel - Math.max(0, distance - readyCellRadius);
    }
}