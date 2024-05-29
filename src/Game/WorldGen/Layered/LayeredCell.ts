import {BoundingBox, Color, Label, Rectangle, Vector} from "excalibur";
import Randomizer from "../Randomizer.ts";
import {BaseActor} from "../../../Actor/BaseActor.ts";
import {MapGenFunction} from "../MapGenFunction.ts";
import {MapRegion} from "../../../Actor/MapRegion.ts";
import {ActorRenderManager} from "../../../Utility/ActorRenderManager.ts";

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

export class LayeredCell { //TODO Sure we want this to be BaseActor? Maybe create a "getTestActor()"?
    static maxLevel: number = 4;
    private currentLevel: number = 0;
    private readonly neighbors: Set<LayeredCell> = new Set<LayeredCell>();
    // private readonly randomizer: Randomizer;
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
        seed: number,
        private readonly area: BoundingBox,
        startingPoints: number,
        private readonly manager: ActorRenderManager,
    ) {
        // super({
        //     pos: area.center,
        //     z: -5,
        // });

        // const grid = this.getGridPos();
        // this.name = `Grid ${grid.x},${grid.y}`;

        this.coordinateOffset = new Vector(-area.width / 2, -area.height / 2);

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
            // 0: randomPoints,
            0: MapGenFunction.generatePointsByRegion(area.width,area.height,startingPoints,(min:number,max:number)=> randomizer.getInt(min, max)),
            1: [],
            2: [],
            3: [],
            4: false,
        };

        // this.renderPoints(randomPoints, Color.DarkGray);

        const gridOutline = new BaseActor({
            z: -5,
            pos: Vector.Zero,
            height: area.height,
            width: area.width,
        })
        gridOutline.graphics.use(new Rectangle({
            height: area.height,
            width: area.width,
            color: Color.Transparent,
            strokeColor: Color.DarkGray,
            lineWidth: 1,
        }));

        // this.addChild(gridOutline)

        // this.graphics.use(new Rectangle({
        //     height: area.height,
        //     width: area.width,
        //     color: Color.Transparent,
        //     strokeColor: Color.DarkGray,
        //     lineWidth: 1,
        // }));

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

    private addChild(actor:BaseActor):void {
        actor.pos = this.translateCoordinatesToGlobal(actor.pos)
        this.manager.add(actor)
    }

    // @ts-expect-error Debug function
    private renderPoints(
        points: Vector[],
        color: Color,
        addLabel: boolean = false,
        addCallback: (actor: BaseActor) => void = actor => this.addChild(actor),
    ): void {
        for (const point of points) {
            addCallback(new BaseActor({
                name: `Point ${Math.round(point.x)},${Math.round(point.y)}`,
                z: -1,
                pos: point,
                radius: 4,
                color,
            }));

            if (!addLabel) {
                return;
            }

            addCallback(new Label({
                name: `Label ${Math.round(point.x)},${Math.round(point.y)}`,
                text: `${Math.round(point.x)},${Math.round(point.y)}`,
                pos: point,
                radius: 2,
                color: Color.Gray,
            }));
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
            // neighbor.readyLevel1();
            const neighborPoints = neighbor.metadata["1"];
            if (neighborPoints === undefined) {
                throw new Error('No lvl 1 data yet?');
            }

            for (const point of neighborPoints) {
                globalPoints.push(neighbor.translateCoordinatesToGlobal(point)); //TODO caching
            }
        }

        for (const globalVertices of MapGenFunction.calculateVertices(globalPoints)) {
            if (globalVertices.length < 3) {
                continue;
            }

            const localVertices = [];
            let hasLocalVertex = false;
            for (const globalVertex of globalVertices) {
                const localVertex = this.translateCoordinatesToLocal(globalVertex);
                if (this.isPointInCell(localVertex)) {
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

        for (const regionData of this.metadata["2"]) {
            const pos = MapGenFunction.calculateAnchor(regionData.vertices);
            if(!this.isPointInCell(pos)) {
                continue;
            }

            this.metadata["3"].push({
                ...regionData,
                pos,
                elevation: Math.min(1, Math.random() + 0.25),
                moisture: 0.5,
            });
        }

        this.currentLevel = 3;
    }

    readyLevel4(): void {
        if (this.metadata["4"]) {
            return;
        }

        this.checkLevelNeighbors(3);

        let i = 0;
        for (const regionData of this.metadata["3"]) {
            // const poly = new BaseActor({
            //     pos: this.translateCoordinatesForRendering(regionData.pos)
            // });
            // poly.z = -2;
            // poly.graphics.use(new Polygon({
            //     points: regionData.vertices,
            //     // points: regionData.vertices.map(point => this.translateCoordinatesForRendering(point)), // Why this no work?
            //     color: Color.Transparent,
            //     strokeColor: Color.ExcaliburBlue,
            //     lineWidth: 3
            // }));

            // this.manager.add(poly)
            // this.addChild(poly);

            // console.log(i, regionData,regionData.vertices.map(vertex => this.translateCoordinatesForRendering(vertex)))
            // this.renderPoints(
            //     regionData.vertices.map(vertex => this.translateCoordinatesForRendering(vertex)),
            //     Color.Red,
            // )

            // this.addChild(new Label({
            //     pos: this.translateCoordinatesForRendering(regionData.pos),
            //     text: `${Math.round(regionData.pos.x)},${Math.round(regionData.pos.y)}`,
            //     color: Color.White,
            //     scale: new Vector(1,1)
            // }))

            // this.addChild(new Label({
            //     pos: this.translateCoordinatesForRendering(regionData.pos),
            //     text: i.toString(),
            //     color: Color.White,
            //     scale: new Vector(1,1)
            // }))

            i++;

            regionData.pos = this.translateCoordinatesForRendering(regionData.pos);
            regionData.vertices = regionData.vertices.map(point => this.translateCoordinatesForRendering(point));
            this.addChild(new MapRegion(
                regionData
            ));
        }

        this.metadata['4'] = true;

        this.currentLevel = 4;
    }

    isPointInCell(point: Vector): boolean {
        return point.x >= 0
            && point.y >= 0
            && point.x <= this.area.width
            && point.y <= this.area.height;
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