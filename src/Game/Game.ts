import {Color, DisplayMode, Engine, SolverStrategy} from "excalibur";
import {WorldScene, WorldSceneData} from "../Scene/WorldScene.ts";


const urlParams = new URLSearchParams(window.location.search);

export default class Game extends Engine {
    constructor(private readonly seed:number = Number.parseInt(urlParams.get('game') ?? Date.now().toString())) {
        super({
            fixedUpdateFps: 60,
            pixelArt: true,
            displayMode: DisplayMode.FitScreenAndFill,
            backgroundColor: Color.Black,
            physics:{
                solver: SolverStrategy.Realistic,
            },
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

        this.add('world', new WorldScene());
        this.goToScene<WorldSceneData>('world',{
          sceneActivationData: {
              world: { //TODO see if it's possible to make everything besides seed optional?
                  seed: this.seed,
                  stable: false,
                  elevationConfig: {
                      // Higher means more zoomed in, showing details better
                      scale: 250, // Current default 200, because it looks nice
                      // Higher means more levels of detail in the noise
                      octaves: 3,//Default 4?
                      // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
                      persistence: 2,//Default 2
                      // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
                      lacunarity: 0.5, //Default 0.5,
                  },
                  moistureConfig: {
                      // Higher means more zoomed in, showing details better
                      scale: 250, // Current default 200, because it looks nice
                      // Higher means more levels of detail in the noise
                      octaves: 1,//Default 4?
                      // Higher means lower amplitude over octaves, resulting in smaller features having more effect (No clue really)
                      persistence: 2,//Default 2
                      // Higher means faster frequency growth over octaves, resulting in higher octaves (meant for smaller features) to be more prominent
                      lacunarity: 0.5, //Default 0.5,
                  }
              }
          }
        });
    }
}