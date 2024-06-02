import {Color, DisplayMode, Engine, Keys, SolverStrategy, Vector} from "excalibur";
import {WorldScene, WorldSceneData} from "../Scene/WorldScene.ts";
import {TileType} from "./WorldGen/Layered/Layer/MapTileLayer.ts";
import Player from "../Actor/Player.ts";


const urlParams = new URLSearchParams(window.location.search);

export default class Game extends Engine {
    private readonly player: Player;

    constructor(private readonly seed: number = Number.parseInt(urlParams.get('game') ?? Date.now().toString())) {
        super({
            fixedUpdateFps: 60,
            pixelArt: true,
            displayMode: DisplayMode.FitScreenAndZoom,
            backgroundColor: Color.Black,
            physics: {
                solver: SolverStrategy.Realistic,
            },
        });

        this.player = new Player(Vector.Zero, true);
    }

    onInitialize() {
        // const client = new NetworkClient(engine, this.seed);
        // new NetworkActorManager(engine);
        //
        // client.init();

        // this.add('run', new RunScene());
        // this.goToScene<RunActivationData>('run',{sceneActivationData:{seed:this.seed}});

        this.add('world', new WorldScene());
        this.goToScene<WorldSceneData>('world', {
            sceneActivationData: {
                player: this.player,
                world: { //TODO see if it's possible to make everything besides seed optional?
                    seed: this.seed,
                    mapTileConfig: {
                        saturation: 1.5,
                        type: TileType.Voronoi,
                        // type: TileType.Square,
                        // type:TileType.FlatTopHexagon,
                        // type:TileType.PointyTopHexagon,
                    }
                }
            }
        });

        let i = 0;
        const types = [
            TileType.Square,
            TileType.FlatTopHexagon,
            TileType.PointyTopHexagon,
            TileType.Voronoi,
        ];

        this.input.keyboard.on('release', ({key}) => {
            if (key !== Keys.Q) {
                return;
            }
            this.goToScene<WorldSceneData>('world', {
                sceneActivationData: {
                    player: this.player,
                    world: { //TODO see if it's possible to make everything besides seed optional?
                        seed: this.seed,
                        mapTileConfig: {
                            saturation: 1.5,
                            // type:TileType.Voronoi,
                            // type: TileType.Square,
                            type: types[i++],
                            // type:TileType.PointyTopHexagon,
                        }
                    }
                }
            });

            if (i > types.length - 1) {
                i = 0;
            }
        });
    }
}