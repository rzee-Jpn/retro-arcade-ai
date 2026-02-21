import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.isClimbing = false;

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

    // ===== LADDERS =====
    this.ladders = this.physics.add.staticGroup();

    const ladderData = [
      { x: 180, y: 550, h: 140 },
      { x: 140, y: 410, h: 140 },
      { x: 220, y: 270, h: 140 }
    ];

    ladderData.forEach(l => {
      const ladder = this.ladders.create(l.x, l.y, null)
        .setDisplaySize(20, l.h)
        .refreshBody();

      this.add.rectangle(l.x, l.y, 20, l.h, 0x00ffcc);
    });

    // ===== PLAYER =====
    this.player = this.physics.add.sprite(180, 550, null)
      .setDisplaySize(20, 30)
      .setTint(0xffff00);

    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Ladder overlap
    this.physics.add.overlap(
      this.player,
      this.ladders,
      () => {
        this.onLadder = true;
      },
      null,
      this
    );

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
    const climbSpeed = 120;

    this.onLadder = false;

    this.physics.overlap(this.player, this.ladders, () => {
      this.onLadder = true;
    });

    // ===== LADDER LOGIC =====
    if (this.onLadder && (this.cursors.up.isDown || this.cursors.down.isDown)) {
      this.isClimbing = true;
    }

    if (this.isClimbing) {
      this.player.body.setAllowGravity(false);
      this.player.setVelocityX(0);

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-climbSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(climbSpeed);
      } else {
        this.player.setVelocityY(0);
      }

      if (!this.onLadder) {
        this.isClimbing = false;
        this.player.body.setAllowGravity(true);
      }

      return;
    }

    this.player.body.setAllowGravity(true);

    // ===== NORMAL MOVEMENT =====
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-320);
    }
  }

  spawnCollectibles() {
    for (let i = 0; i < 5; i++) {
      const item = this.collectibles.create(
        Phaser.Math.Between(40, 320),
        Phaser.Math.Between(120, 540),
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

    if (this.lives <= 0) {
      this.scene.restart();
    } else {
      this.player.setPosition(180, 550);
      this.player.setVelocity(0, 0);
    }
  }
}