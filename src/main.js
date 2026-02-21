import Phaser from "phaser";
import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 500 }, debug: false }
  },
  scene: [GameScene]
};

new Phaser.Game(config);
