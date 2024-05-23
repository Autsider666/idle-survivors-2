import {CollisionType, PolygonCollider, Vector} from "excalibur";
import {BaseActor} from "./BaseActor";
import {SlowedComponent} from "../Component/SlowedComponent";
import {CollisionGroup} from "../Game/CollisionGroups";

export type RegionProps = {
    pos: Vector,
    vertices: Vector[],
    elevation: number,
    moisture: number,
}

export class MapRegion extends BaseActor {
    private elevation: number;
    private moisture: number;
    // private vertices: Vector[];

    // private graphic: Graphic;

    constructor({pos, elevation, moisture, vertices}: RegionProps) {
        const collider = new PolygonCollider({
            points: vertices.map(vertice => vertice.sub(pos)),
            suppressConvexWarning: true,
        });
        super({
            pos,
            z: -1,
            // collider: new CircleCollider({radius: 20}),
            collider: collider.isConvex() ? collider : collider.triangulate(),
            collisionType: CollisionType.Passive,
            collisionGroup: CollisionGroup.Ground,
            // radius: 3,
            // color: Color.Red,
        });

        this.elevation = elevation;
        this.moisture = moisture;

        if (vertices.length < 4) {
            throw new Error('Need more vertices for a Poligon.');
        }

        // this.vertices = vertices;

        // this.graphic = this.generatePolygon();
        // this.graphics.use(this.graphic);

        this.on<'collisionstart'>('collisionstart', ({other}) => {
            if (this.elevation < 0.5) {
                other.addComponent(new SlowedComponent());
                other.get(SlowedComponent).counter++;
            }
        });

        this.on<'collisionend'>('collisionend', ({other}) => {
            if (this.elevation < 0.5) {
                if ((--other.get(SlowedComponent).counter) === 0) {
                    other.removeComponent(SlowedComponent);
                }
            }
        });
    }

    // private generatePolygon(): Polygon {
    //     return new Polygon({
    //         points: this.vertices,
    //         color: Color.fromRGBString(this.biomeColorFunction()),
    //     });
    // }

    // private biomeColorFunction(): string {
    //     let elevation = (this.elevation - 0.5) * 2;
    //     let moisture = this.moisture;
    //     let red: number;
    //     let green: number;
    //     let blue: number;
    //     if (elevation < 0.0) {
    //         red = 48 + 48 * elevation;
    //         green = 64 + 64 * elevation;
    //         blue = 127 + 127 * elevation;
    //     } else {
    //         moisture = moisture * (1 - elevation);
    //         elevation = elevation ** 4; // tweaks
    //         red = 210 - 100 * moisture;
    //         green = 185 - 45 * moisture;
    //         blue = 139 - 45 * moisture;
    //         red = 255 * elevation + red * (1 - elevation);
    //         green = 255 * elevation + green * (1 - elevation);
    //         blue = 255 * elevation + blue * (1 - elevation);
    //     }
    //     return `rgb(${Math.max(0, red) | 0}, ${Math.max(0, green) | 0}, ${Math.max(0, blue) | 0})`;
    // }
}