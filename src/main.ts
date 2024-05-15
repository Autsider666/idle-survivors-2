import { Color } from "excalibur";
import { Monster } from "./Actors/Monster";
import Player from "./Actors/Player";
import { Weapon } from "./Actors/Weapon";
import Game from "./Utility/Game";

const game = new Game();

const player = new Player(200, 200);
game.add(player);

const weapon2 = new Weapon(150, Color.Magenta, 3);
player.addChild(weapon2);

const weapon1 = new Weapon(70);
player.addChild(weapon1);

const monster = new Monster(400, 200);
game.add(monster);

game.start();