import Phaser from "phaser";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#2c3e50",
    scene: {
        preload,
        create
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Загружаем 2 картинки
    this.load.image("card-back", "https://labs.phaser.io/assets/sprites/cardBack_blue2.png");
    this.load.image("card-front", "https://labs.phaser.io/assets/sprites/cardSpadesA.png");
}

function create() {
    let isOpen = false;

    const card = this.add.image(400, 300, "card-back")
        .setInteractive();

    card.on("pointerdown", () => {
        if (isOpen) {
            card.setTexture("card-back");
        } else {
            card.setTexture("card-front");
        }
        isOpen = !isOpen;
    });
}