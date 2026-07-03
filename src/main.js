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

new Phaser.Game(config);

function preload() {
    // Загружаем 2 картинки
    this.load.image("card-back", "https://github.com/altermann/jackal/blob/16431e4083d7c1ab610a0525ad31cab6415664d3/jackal/src/assets/hero.png");
    this.load.image("card-front", "https://github.com/altermann/jackal/blob/94237ab8be20ef6b0f483defb00f098caadd1df4/jackal/src/assets/T_FlakesA_N.png");
}

function create() {
    const rows = 3;
    const cols = 4;

    const startX = 200;
    const startY = 150;
    const spacingX = 120;
    const spacingY = 150;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            let isOpen = false;

            const card = this.add.image(
                startX + x * spacingX,
                startY + y * spacingY,
                "back"
            ).setInteractive();

            card.on("pointerdown", () => {
                isOpen = !isOpen;
                card.setTexture(isOpen ? "front" : "back");
            });
        }
    }
}
