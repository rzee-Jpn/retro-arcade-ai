import Phaser from "phaser";
import GameScene from "./scenes/GameScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  physics:{
    default:"arcade",
    arcade:{ gravity:{ y:500 } }
  },
  scene:[GameScene]
});
