import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.physics.world.setBounds(0, 0, 360, 640);

    this.platforms = this.physics.add.staticGroup();

    // Ground
    this.platforms.create(180, 620, null)
      .setDisplaySize(360, 40)
      .refreshBody();

    // Middle platforms
    this.platforms.create(180, 480, null)
      .setDisplaySize(300, 20)
      .refreshBody();

    this.platforms.create(180, 340, null)
      .setDisplaySize(250, 20)
      .refreshBody();

    this.platforms.create(180, 200, null)
      .setDisplaySize(200, 20)
      .refreshBody();

    // Simple graphics for platforms
    this.add.rectangle(180, 620, 360, 40, 0x4444ff);
    this.add.rectangle(180, 480, 300, 20, 0x4444ff);
    this.add.rectangle(180, 340, 250, 20, 0x4444ff);
    this.add.rectangle(180, 200, 200, 20, 0x4444ff);
  }
}