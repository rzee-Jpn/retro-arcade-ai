export default class GameScene extends Phaser.Scene {
  constructor(){
    super("game");
  }

  preload(){}

  create(){
    this.add.text(80,300,"AI Arcade Prototype");
  }

  update(){}
}
