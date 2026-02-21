import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {}

  create() {
    this.add.text(100, 300, "AI Arcade Starter", {
      fontSize: "20px",
      fill: "#ffffff"
    });
  }

  update() {}
}
