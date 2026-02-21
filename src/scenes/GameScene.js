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
    this.player.setBounce(0.1);

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    // ===== ENEMY =====
    this.enemy = this.physics.add.sprite(100, 550, null)
      .setDisplaySize(20, 30)
      .setTint(0xff00ff);

    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);

    this.physics.add.collider(this.enemy, this.platforms);

    this.resetEnemySpeed();

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

    const speed = 150;

    // Smooth horizontal control
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-320);
    }
  }

  spawnCollectibles() {
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(40, 320);
      const y = Phaser.Math.Between(120, 540);

      const item = this.collectibles.create(x, y, null)
        .setDisplaySize(15, 15)
        .setTint(0xff0000);

      item.body.setAllowGravity(false);
    }
  }

  collectItem(player, item) {
    const x = item.x;
    const y = item.y;

    item.destroy();

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    // Floating score effect
    const popup = this.add.text(x, y, "+10", {
      fontSize: "14px",
      fill: "#ffff00"
    });

    this.tweens.add({
      targets: popup,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy()
    });

    if (this.collectibles.countActive() === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;
    this.levelText.setText("Level: " + this.level);

    this.spawnCollectibles();
    this.resetEnemySpeed();
  }

  resetEnemySpeed() {
    const baseSpeed = 80;
    const speed = baseSpeed + this.level * 30;

    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

    this.enemy.setVelocityX(speed * direction);
  }

  hitEnemy() {
    this.lives--;
    this.livesText.setText("Lives: " + this.lives);

    // Knockback effect
    const knock = this.player.x < this.enemy.x ? -200 : 200;
    this.player.setVelocity(knock, -200);

    if (this.lives <= 0) {
      this.scene.restart();
    } else {
      this.time.delayedCall(500, () => {
        this.player.setPosition(180, 550);
        this.player.setVelocity(0, 0);
      });
    }
  }
}