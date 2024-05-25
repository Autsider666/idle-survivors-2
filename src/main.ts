
import "./style.css";
import Game from "./Game/Game";
import {ImageLoader} from "./Utility/ImageLoader.ts";

const game = new Game();

game.start(new ImageLoader());
