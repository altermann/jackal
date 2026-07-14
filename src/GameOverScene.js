import Phaser from "phaser";
import { gameTextStyle } from "./ui/fonts.js";

const WINNER_TEXTURES = ["charP", "charT"];

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    init(data) {
        this.winner = data.winner ?? null;
        this.players = data.players ?? [];
    }

    create() {
        this.drawBackground();

        const { width, height } = this.scale;
        const centerX = width / 2;

        this.add.text(centerX, height * 0.14, "Game over", gameTextStyle({
            fontSize: "44px",
            color: "#f1c40f",
            fontStyle: "bold"
        })).setOrigin(0.5);

        if (this.winner) {
            this.add.text(centerX, height * 0.24, `Winner: ${this.winner.name}`, gameTextStyle({
                fontSize: "30px",
                color: `#${this.winner.color.toString(16).padStart(6, "0")}`,
                fontStyle: "bold"
            })).setOrigin(0.5);

            const portrait = this.add.image(centerX, height * 0.46, WINNER_TEXTURES[this.winner.id]);
            const portraitSize = Math.min(width * 0.55, height * 0.32);
            portrait.setDisplaySize(portraitSize, portraitSize);
        } else {
            this.add.text(centerX, height * 0.24, "Tie!", gameTextStyle({
                fontSize: "34px",
                color: "#ecf0f1",
                fontStyle: "bold"
            })).setOrigin(0.5);

            const banner = this.add.image(centerX, height * 0.46, "menuBanner");
            const maxBannerWidth = width - 48;
            const bannerScale = Math.min(1, maxBannerWidth / banner.width);
            banner.setScale(bannerScale);
        }

        this.players.forEach((player, index) => {
            const x = index === 0 ? width * 0.28 : width * 0.72;
            this.add.text(x, height * 0.62, `${player.name}: ${player.gold} 🪙`, gameTextStyle({
                fontSize: "24px",
                color: `#${player.color.toString(16).padStart(6, "0")}`
            })).setOrigin(0.5);
        });

        const buttonY = height * 0.78;
        const restartButton = this.add.rectangle(centerX, buttonY, 300, 58, 0x27ae60)
            .setInteractive({ useHandCursor: true });

        this.add.text(centerX, buttonY, "Play again", gameTextStyle({
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold"
        })).setOrigin(0.5);

        restartButton.on("pointerdown", () => {
            restartButton.setFillStyle(0x1e8449);
            this.scene.start("GameScene");
        });
    }

    drawBackground() {
        const { width, height } = this.scale;

        this.background = this.add.image(0, 0, "backgroundTile")
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(-1);

        this.background.setDisplaySize(width, height);
        this.scale.on("resize", this.resizeBackground, this);
    }

    resizeBackground(gameSize) {
        this.background.setDisplaySize(gameSize.width, gameSize.height);
    }
}
