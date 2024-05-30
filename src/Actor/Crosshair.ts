import {BaseActor} from "./BaseActor.ts";
import {Circle, Color, GraphicsGroup} from "excalibur";

const crosshairGraphic = new Circle({
    radius: 10,
    color: Color.Transparent,
    strokeColor: Color.Red,
    lineWidth: 3,
    lineDash: [5],
});

// const generateLabelText = (charges: number): string => {
//     let text = '';
//     for (let i = 0; i < Math.floor(charges); i++) {
//         text += '.';
//     }
//
//     return text;
// };

// this.label = new Label({
//     text: generateLabelText(this.remainingCharges),
//     color: landingAreaData.color,
//     pos: new Vector(-7 + -4 * this.maxCharges, -13),
//     font: new Font({
//         size: 50,
//     }),
//     anchor: new Vector(0.5, 1)
//
// });
// this.landingArea.addChild(this.label);

export class Crosshair extends BaseActor {
    private readonly graphicsGroup: GraphicsGroup;

    constructor() {
        super();

        this.graphicsGroup = new GraphicsGroup({
            members: [crosshairGraphic],
        });

        this.graphics.use(this.graphicsGroup);
    }

    onPostUpdate() {
        if (!(this.parent instanceof BaseActor)) {
            return;
        }

        this.parent.vel;
    }
}