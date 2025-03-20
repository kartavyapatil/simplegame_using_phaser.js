import './style.css'
import Phaser from 'phaser';

const speedDown = 10;
class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.bag;
    this.bag_pump;
    this.cursors;
    this.bag_handle;
    this.bag_handle_speed = speedDown;
    this.isMovingUp = false;
    this.isMovingDown = false;
    this.clickCount = 0;
    this.renderTexture = null;
    this.randomnumber = 1;
    this.usedValues = new Set();
  }

  preload() {
    this.load.image("bg", "assets/background.png");
    this.load.image("bag", "assets/bag.png");
    this.load.image("bag_pump", "assets/bag_pump.png");
    this.load.image("bag_handle", "assets/bag_handle.png");

    for (let i = 1; i <= 10; i++) {
      this.load.image(`balloon${i}`, `assets/ballon${i}.png`);
    }

    for (let i = 1; i <= 26; i++) {
      this.load.image(`symbol${i}`, `assets/Symbol${i}.png`);
    }
    this.load.image("common", "assets/common.png");
    this.load.image("particals", "assets/praticals.png");
  }

  create() {
    const backgroundImage = this.add.image(0, 0, 'bg').setOrigin(0, 0);
    backgroundImage.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.bag = this.add.image(this.cameras.main.width - 300, this.cameras.main.height - 250, "bag")
      .setOrigin(0, 0).setDepth(1).setScale(0.5);

    this.bag_pump = this.add.image(this.cameras.main.width - 440, this.cameras.main.height - 275, "bag_pump")
      .setOrigin(0, 0).setDepth(0).setScale(0.5);

    this.bag_handle = this.physics.add.image(this.cameras.main.width - 300, this.cameras.main.height - 400, "bag_handle")
      .setOrigin(0, 0).setDepth(0).setScale(0.45).setImmovable(true);

    this.bag_handle.body.allowGravity = false;
    this.bag_handle.setCollideWorldBounds(true);


    this.originalY = this.cameras.main.height - 400;
    this.renderTexture = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height);
    console.log(this.cameras.main.height)
    this.bag_handle.setInteractive();
    this.input.on('pointerdown', (pointer) => {
      let targetX = this.cameras.main.width - 260;
      let targetY = this.cameras.main.height - 370;
      if (
        pointer.x >= targetX &&
        pointer.x <= targetX + 200 &&
        pointer.y >= targetY &&
        pointer.y <= targetY + 200
      ) {
        this.bag_handle.y = this.originalY;
        this.tweens.add({
          targets: this.bag_handle,
          y: this.originalY + 100,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            this.tweens.add({
              targets: this.bag_handle,
              y: this.originalY,
              duration: 100,
              ease: 'Power2'
            });
          }
        });
        this.clickCount++;
      }


      if (this.clickCount === 1) {
        this.createBalloon();
      } else if (this.clickCount === 2) {
        this.increaseLastBalloonSize();
      } else if (this.clickCount === 3) {
        this.releaseLastBalloon();
        this.clickCount = 0;
      }
    });
  }
  createBalloon() {
    let randomBalloon = Phaser.Math.Between(1, 10);

    let numberImage = this.add.image(this.cameras.main.width - 373, this.cameras.main.height - 254, `symbol${this.randomnumber}`)
      .setOrigin(0.5).setScale(0.1).setDepth(1);

    if (this.randomnumber < 26) {
      this.randomnumber++;
    } else {
      this.randomnumber = 1;
    }
    let common = this.add.image(this.cameras.main.width - 373, this.cameras.main.height - 206, `common`)
      .setOrigin(0.5).setScale(0.1).setDepth(0);
    let balloonImage = this.add.sprite(this.cameras.main.width - 373, this.cameras.main.height - 254, `balloon${randomBalloon}`)
      .setOrigin(0.5).setScale(0.15)
      .setInteractive();


    this.emitter = this.add.particles(0, 0, "particals", {
      speed: 100,
      gravityY: 200,
      scale: 0.4,
      duration: 100,
      emitting: false
    });
    // this.emitter.startFollow(balloonImage);


    balloonImage.on('pointerdown', () => {
      this.emitter.startFollow(balloonImage)
      this.emitter.emitParticleAt(balloonImage.x, balloonImage.y, 100);
      balloonImage.destroy();
      numberImage.destroy();
      common.destroy();
    });
    this.renderTexture.draw(common, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500));
    this.renderTexture.draw(balloonImage, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500));
    this.renderTexture.draw(numberImage, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500));

    this.lastBalloon = balloonImage;
    this.numberImage = numberImage;
    this.common = common;
  }
  increaseLastBalloonSize() {
    if (this.lastBalloon) {
      this.tweens.add({
        targets: this.lastBalloon,
        scale: 0.25,
        y: this.lastBalloon.y - 20,
        duration: 1000,
        ease: 'Power2'
      });
    }
    if (this.numberImage) {
      this.tweens.add({
        targets: this.numberImage,
        scale: 0.2,
        y: this.numberImage.y - 20,
        duration: 1000,
        ease: 'Power2'
      });
    }
    if (this.common) {
      this.tweens.add({
        targets: this.common,
        scale: 0.2,
        y: this.common.y,
        duration: 1000,
        ease: 'Power2'
      });
    }

  }

  // usedValues = new Set();

  getUniqueValue() {
    let newValue = this.getRandomValue();
    while ([...this.usedValues].some(val => Math.abs(val - newValue) < 40)) {
      newValue = this.getRandomValue();
    }
    this.usedValues.add(newValue);
    return newValue;
  }
  getRandomValue() {
    return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  }
  releaseLastBalloon() {
    let randomX = this.getUniqueValue();
    let randomY = Phaser.Math.Between(-300, -80);
    if (this.lastBalloon) {

      this.tweens.add({
        targets: this.lastBalloon,
        x: this.lastBalloon.x + (-randomX),
        y: this.lastBalloon.y + randomY,
        scale: 0.3,
        duration: 2000,
        ease: 'Power2'
      });

      this.lastBalloon = null;
    }
    if (this.numberImage) {
      this.tweens.add({
        targets: this.numberImage,
        x: this.numberImage.x + (-randomX),
        y: this.numberImage.y + randomY,
        scale: 0.25,
        duration: 2000,
        ease: 'Power2',
      });
    }
    if (this.common) {
      this.tweens.add({
        targets: this.common,
        x: this.common.x + (-randomX),
        y: this.common.y + randomY + 20,
        scale: 0.25,
        duration: 2000,
        ease: 'Power2',
      });
    }
  }

  update() { }
}

const config = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  canvas: gameCanvas,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: [GameScene],
}

const game = new Phaser.Game(config);