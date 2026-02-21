import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;

    this.physics.world.setBounds(0, 0, 360, 640);

    // ===== PLATFORMS =====
    this.platforms = this.physics.add.staticGroup();

    const platformData = [
      { x: 180, y: 620, w: 360, h: 40 },
      { x: 180, y: 480, w: 300, h: 20 },
      { x: 180, y: 340, w: 250, h: 20 },
      { x: 180, y: 200, w: 200, h: 20 }
    ];

    platformData.forEach(p => {
      this.platforms.create(p.x, p.y, null)
        .setDisplaySize(p.w, p.h)
        .refreshBody();

      this.add.rectangle(p.x, p.y, p.w, p.h, 0x4444ff);
    });

    // ===== PLAYER =====
    this.player = this.physics.add.sprite(180, 550, null)
      .setDisplaySize(20, 30)
      .setTint(0xffff00);

    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    // ===== ENEMY =====
    this.enemy = this.physics.add.sprite(100, 550, null)
      .setDisplaySize(20, 30)
      .setTint(0xff00ff);

    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);
    this.enemy.setVelocityX(80 + this.level * 20);

    this.physics.add.collider(this.enemy, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.hitEnemy,
      null,
      this
    );

    // ===== COLLECTIBLES =====
    this.collectibles = this.physics.add.group();

    this.spawnCollectibles();

    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // ===== UI =====
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "16px",
      fill: "#ffffff"
    });

    this.livesText = this.add.text(260, 10, "Lives: 3", {
      fontSize: "16px",
      fill: "#ffffff"
    });

    this.levelText = this.add.text(140, 10, "Level: 1", {
      fontSize: "16px",
      fill: "#ffffff"
    });
  }

  update() {
    if (!this.player.active) return;

    // Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(150);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-300);
    }
  }

  spawnCollectibles() {
    for (let i = 0; i < 5; i++) {
      const item = this.collectibles.create(
        Phaser.Math.Between(50, 300),
        Phaser.Math.Between(100, 500),
        null
      )
      .setDisplaySize(15, 15)
      .setTint(0xff0000);

      item.body.setAllowGravity(false);
    }
  }

  collectItem(player, item) {
    item.destroy();

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    if (this.collectibles.countActive() === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;
    this.levelText.setText("Level: " + this.level);

    this.spawnCollectibles();

    // Increase enemy speed
    const speed = 80 + this.level * 30;
    this.enemy.setVelocityX(this.enemy.body.velocity.x > 0 ? speed : -speed);
  }

  hitEnemy() {
    this.lives--;
    this.livesText.setText("Lives: " + this.lives);

    if (this.lives <= 0) {
      this.scene.restart();
    } else {
      this.player.setPosition(180, 550);
      this.player.setVelocity(0, 0);
    }
  }
}