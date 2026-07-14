import Phaser from "phaser";
import "./fonts.css";
import PreloadScene from "./PreloadScene.js";
import MenuScene from "./MenuScene.js";
import GameScene from "./GameScene.js";
import GameOverScene from "./GameOverScene.js";

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
    scene: [PreloadScene, MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
