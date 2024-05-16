
import "./style.css";
import { Color } from "excalibur";
import Player from "./Actor/Player";
import { Weapon } from "./Actor/Weapon";
import Game from "./Utility/Game";
import { MonsterSpawner } from "./Utility/MonsterSpawner";
import PlayerCameraStrategy from "./Utility/PlayerCameraStrategy";

const game = new Game();

const player = new Player(200, 200);
game.add(player);

game.on("initialize", () => {
  game.currentScene.camera.addStrategy(new PlayerCameraStrategy(player))
});

const weapon2 = new Weapon(150, Color.Magenta, 3);
player.addChild(weapon2);

const weapon1 = new Weapon(50, Color.White, 10);
player.addChild(weapon1);

const spawner = new MonsterSpawner(game);
spawner.spawnMonster();

game.start();