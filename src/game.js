import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  constructor() {
    super("main");
  }

  create() {
    this.add.text(100, 100, "Моя первая игра", {
      fontSize: "32px",
      color: "#ffffff"
    });

    this.add.text(100, 200, "Нажми сюда", {
      fontSize: "24px",
      backgroundColor: "#0000ff",
      padding: { x: 10, y: 5 }
    }).setInteractive()
      .on("pointerdown", () => {
        console.log("Клик!");
      });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  scene: MainScene
};

new Phaser.Game(config);