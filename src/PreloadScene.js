import Phaser from "phaser";

import cardBack from "./assets/cardB.png";
import cardBackDownLeft from "./assets/cardB_down_left.png";
import cardBackDownRight from "./assets/cardB_down_right.png";
import cardBackLeftDown from "./assets/cardB_left_down.png";
import cardBackRightDown from "./assets/cardB_right_down.png";
import cardGold from "./assets/cardG.png";
import cardLose from "./assets/cardF.png";
import cardPass from "./assets/cardN.png";
import cardBackStep from "./assets/cardJ.png";
import cardDock from "./assets/cardD.png";
import backgroundTile from "./assets/BackGround.png";
import menuBanner from "./assets/menuB.png";
import charT from "./assets/charTs.png";
import charP from "./assets/charPs.png";
import jump2Sound from "./assets/sounds/jump2.wav";
import getCoinsSound from "./assets/sounds/getCoins.wav";
import looseCoinsSound from "./assets/sounds/looseCoins.wav";
import pushBack2Sound from "./assets/sounds/pushBack2.wav";
import bonusSound from "./assets/sounds/bonus.wav";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image("cardBack", cardBack);
        this.load.image("cardBackDownLeft", cardBackDownLeft);
        this.load.image("cardBackDownRight", cardBackDownRight);
        this.load.image("cardBackLeftDown", cardBackLeftDown);
        this.load.image("cardBackRightDown", cardBackRightDown);
        this.load.image("cardGold", cardGold);
        this.load.image("cardLose", cardLose);
        this.load.image("cardPass", cardPass);
        this.load.image("cardBackStep", cardBackStep);
        this.load.image("cardDock", cardDock);
        this.load.image("backgroundTile", backgroundTile);
        this.load.image("menuBanner", menuBanner);
        this.load.image("charT", charT);
        this.load.image("charP", charP);
        this.load.audio("jump2", jump2Sound);
        this.load.audio("getCoins", getCoinsSound);
        this.load.audio("looseCoins", looseCoinsSound);
        this.load.audio("pushBack2", pushBack2Sound);
        this.load.audio("bonus", bonusSound);
    }

    create() {
        this.scene.start("MenuScene");
    }
}
