import {Color, DisplayMode, Engine} from "excalibur";
import {RunActivationData, RunScene} from "../Scene/RunScene.ts";


const urlParams = new URLSearchParams(window.location.search);

export default class Game extends Engine {
    constructor(private readonly seed:number = Number.parseInt(urlParams.get('game') ?? Date.now().toString())) {
        super({
            // width: VIEWPORT_WIDTH * VIEWPORT_SCALE,
            // height: VIEWPORT_HEIGHT * VIEWPORT_SCALE,
            // fixedUpdateFps: 60,
            // antialiasing: false,
            // pixelArt: true,
            displayMode: DisplayMode.FitScreenAndFill,
            backgroundColor: Color.Black,
        });
    }

    onInitialize(engine: Engine) {
        super.onInitialize(engine);

        // const client = new NetworkClient(engine, this.seed);
        // new NetworkActorManager(engine);
        //
        // client.init();

        this.add('run', new RunScene());
        this.goToScene<RunActivationData>('run',{sceneActivationData:{seed:this.seed}});
    }
}