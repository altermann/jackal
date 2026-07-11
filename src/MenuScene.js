import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        this.drawBackground();

        const { width, height } = this.scale;
        const banner = this.add.image(width / 2, height * 0.34, "menuBanner");
        const maxBannerWidth = width - 48;
        const bannerScale = Math.min(1, maxBannerWidth / banner.width);
        banner.setScale(bannerScale);

        const buttonY = height * 0.72;
        const startButton = this.add.rectangle(width / 2, buttonY, 300, 58, 0x27ae60)
            .setInteractive({ useHandCursor: true });

        this.add.text(width / 2, buttonY, "Начать игру", {
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        startButton.on("pointerdown", () => {
            startButton.setFillStyle(0x1e8449);
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
