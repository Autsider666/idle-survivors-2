import {Color, DisplayMode, Engine, SolverStrategy} from "excalibur";
import {TestScene} from "../Scene/TestScene.ts";


const urlParams = new URLSearchParams(window.location.search);

export default class Game extends Engine {
    constructor(private readonly seed:number = Number.parseInt(urlParams.get('game') ?? Date.now().toString())) {
        super({
            // width: VIEWPORT_WIDTH * VIEWPORT_SCALE,
            // height: VIEWPORT_HEIGHT * VIEWPORT_SCALE,
            fixedUpdateFps: 60,
            // antialiasing: false,
            // pixelArt: true,
            displayMode: DisplayMode.FitScreenAndFill,
            backgroundColor: Color.Black,
            physics:{
                solver: SolverStrategy.Realistic,
            }
        });
    }

    onInitialize(engine: Engine) {
        super.onInitialize(engine);

        // const client = new NetworkClient(engine, this.seed);
        // new NetworkActorManager(engine);
        //
        // client.init();

        // this.add('run', new RunScene());
        // this.goToScene<RunActivationData>('run',{sceneActivationData:{seed:this.seed}});

        this.add('test', new TestScene(this.seed));
        this.goToScene('test');
    }
}