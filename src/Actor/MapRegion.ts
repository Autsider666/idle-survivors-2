import {CollisionType, Color, Graphic, Polygon, PolygonCollider, Vector} from "excalibur";
import {BaseActor} from "./BaseActor";
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

    private graphic: Graphic;

    constructor({pos, elevation, moisture, vertices}: RegionProps) {
        vertices = vertices.map(vertex => vertex.sub(pos));
        const collider = new PolygonCollider({
            points: vertices,
            suppressConvexWarning: true,
        });
        super({
            pos,
            z: -10,
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

        this.graphic = this.generatePolygon(vertices);
        this.graphics.use(this.graphic);

        // this.on<'collisionstart'>('collisionstart', ({other}) => {
        //     if (other instanceof Player) {
        //         console.log(this.elevation);
        //     }
        //     if (this.isSlow()) {
        //         other.addComponent(new SlowedComponent());
        //         other.get(SlowedComponent).counter++;
        //     }
        // });
        //
        // this.on<'collisionend'>('collisionend', ({other}) => {
        //     if (this.isSlow()) {
        //         if ((--other.get(SlowedComponent).counter) === 0) {
        //             other.removeComponent(SlowedComponent);
        //         }
        //     }
        // });
    }

    private generatePolygon(vertices: Vector[]): Polygon {
        return new Polygon({
            points: vertices,
            strokeColor: Color.Black,
            lineWidth:1,
            // color: Color.Transparent,
            color: Color.fromRGBString(this.biomeColorFunction()),
            // color: Color.fromHex(this.biomeTypeFunction()),
        });
    }

    private biomeColorFunction(): string {
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
        } else if (elevation < 0.7 ) {
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
        return `rgb(${Math.max(0, red) | 0}, ${Math.max(0, green) | 0}, ${Math.max(0, blue) | 0})`;
    }

    private biomeTypeFunction():string {
        if (this.elevation < 0.1) return '#26618d';// WATER
        else if (this.elevation < 0.2) return '#d5b63b';// BEACH
        else if (this.elevation < 0.3) return '#21b65d';// FOREST
        else if (this.elevation < 0.5) return '#15773b';// JUNGLE
        else if (this.elevation < 0.7) return '#d5b63b';// SAVANNAH
        else if (this.elevation < 0.9) return '#987F6E42';// DESERT
        else return '#FFF';// SNOW
    }

    isSlow():boolean {
        return this.elevation < 0.5;
    }

    isSafe() {
        return !this.isSlow();
    }
}