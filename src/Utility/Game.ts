import { DisplayMode, Engine, Vector } from "excalibur";

export const VIEWPORT_WIDTH = 160 + 48;
export const VIEWPORT_HEIGHT = 144 + 48;
export const VIEWPORT_SCALE = 2;
export const SCALE_2x = new Vector(2, 2);

export default class Game extends Engine {
    constructor() {
        super({
            // width: VIEWPORT_WIDTH * VIEWPORT_SCALE,
            // height: VIEWPORT_HEIGHT * VIEWPORT_SCALE,
            // fixedUpdateFps: 60,
            // antialiasing: false,
            pixelArt: true,
            displayMode: DisplayMode.FitScreenAndFill
        });

    }
}