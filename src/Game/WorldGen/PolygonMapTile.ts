import {CollisionType, Color, Polygon as PolygonGraphic, PolygonCollider, Vector} from "excalibur";
import {BaseActor} from "../../Actor/BaseActor.ts";
import {CollisionGroup} from "../CollisionGroups.ts";
import {SlowedComponent} from "../../Component/SlowedComponent.ts";
import {MapGenFunction} from "./MapGenFunction.ts";
import {Polygon} from "../../Utility/Geometry/Polygon.ts";
import {NeighborInterface} from "./NeighborInterface.ts";
import {Neighbourhood} from "./Neighbourhood.ts";

export type RegionProps = {
    polygon: Polygon,
    elevation: number,
    moisture: number,
    saturation?: number,
}

export class PolygonMapTile extends BaseActor implements NeighborInterface { //TODO split into components?
    private readonly elevation: number;
    private readonly moisture: number;
    private readonly globalVertices: Vector[];

    constructor(
        {polygon, elevation, moisture, saturation = 1}: RegionProps,
        private readonly neighborhood: Neighbourhood<PolygonMapTile>,
    ) {
        const pos = polygon.center;
        const vertices = polygon.vertices.map(vertex => vertex.sub(pos));
        const collider = new PolygonCollider({
            points: vertices,
            suppressConvexWarning: true,
        });
        super({
            name: `Region ${Math.round(pos.x)},${Math.round(pos.y)}`,
            pos,
            z: -10,
            // collider: new CircleCollider({radius: 20}),
            collider: collider.isConvex() ? collider : collider.triangulate(),
            collisionType: CollisionType.Passive,
            collisionGroup: CollisionGroup.Ground,
            // radius: 3,
            // color: Color.Red,
        });

        this.globalVertices = polygon.vertices;

        this.elevation = elevation;
        this.moisture = moisture;

        if (vertices.length < 3) {
            throw new Error('Need more vertices for a Poligon.');
        }

        this.graphics.use(this.generatePolygon(vertices, saturation));

        this.on<'collisionstart'>('collisionstart', ({other}) => {
            if (this.isSlow()) {
                other.addComponent(new SlowedComponent());
                other.get(SlowedComponent).counter++;
            }
        });

        this.on<'collisionend'>('collisionend', ({other}) => {
            if (this.isSlow()) {
                const component = other.get(SlowedComponent);
                if (component && (--component.counter) === 0) {
                    other.removeComponent(SlowedComponent);
                }
            }
        });

        if (this.isSafe()) {
            this.body.collisionType = CollisionType.PreventCollision;
        }

        this.neighborhood.add(this);
    }

    getNeighbourhoodPoints(): Vector[] {
        return this.globalVertices;
    }

    getNeighbors(): ReadonlyArray<PolygonMapTile> {
        return this.neighborhood.getNeighbors(this);
    }

    private generatePolygon(vertices: Vector[], saturation: number): PolygonGraphic {
        return new PolygonGraphic({
            points: vertices,
            strokeColor: Color.Black,
            lineWidth: 1,
            // color: Color.Transparent,
            color: Color.fromRGBString(this.biomeColorFunction(saturation)),
            // color: Color.fromHex(this.biomeTypeFunction()),
        });
    }

    private biomeColorFunction(saturation: number): string {
        let elevation = (this.elevation - 0.5) * 2;
        // let elevation = this.elevation -0.5;
        let moisture = this.moisture * 2;
        let red: number;
        let green: number;
        let blue: number;
        if (elevation < 0.0) {
            red = 48 + 48 * elevation;
            green = 64 + 64 * elevation;
            blue = 127 + 127 * elevation;
        } else if (elevation < 0.7) {
            moisture = moisture * (1 - elevation);
            elevation = elevation ** 4; // tweaks
            red = 210 - 100 * moisture;
            green = 185 - 45 * moisture;
            blue = 139 - 45 * moisture;
            red = 255 * elevation + red * (1 - elevation);
            green = 255 * elevation + green * (1 - elevation);
            blue = 255 * elevation + blue * (1 - elevation);
        } else {
            red = 220 * elevation;
            green = 220 * elevation;
            blue = 220 * elevation;
        }

        const color = MapGenFunction.applySaturation(
            red,
            green,
            blue,
            saturation,
        );

        return `rgb(${color.red | 0}, ${color.green | 0}, ${color.blue | 0})`;
    }

    isSlow(): boolean {
        return this.elevation < 0.5;
    }

    isSafe() {
        return !this.isSlow();
    }
}