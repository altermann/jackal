import Phaser from "phaser";
import GameScene from "./GameScene.js";

const config = {
    type: Phaser.AUTO,
    parent: "app",
    backgroundColor: "#1a252f",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 900,
        height: 1600
    },
    scene: [GameScene]
};

new Phaser.Game(config);
