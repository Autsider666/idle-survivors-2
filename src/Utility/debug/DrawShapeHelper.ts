import { Actor, BoundingBox, Color, Vector } from "excalibur";

// This is from Matt. Thanks, Matt!
export default class DrawShapeHelper {
    constructor(actor: Actor) {
        actor.scene?.on("postdraw", ({ ctx }) => {
            const bounds = actor.collider.bounds;
            const scene = actor.scene;
            if (scene === null) {
                return;
            }

            const { x: left, y: top } =
                scene.engine.screen.worldToScreenCoordinates(
                    new Vector(bounds.left, bounds.top)
                );
            const { x: right, y: bottom } =
                scene.engine.screen.worldToScreenCoordinates(
                    new Vector(bounds.right, bounds.bottom)
                );
            const newBounds = new BoundingBox({
                left,
                top,
                right,
                bottom,
            });
            newBounds.draw(ctx, Color.Yellow);
        });
    }
}
