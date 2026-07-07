import Phaser from "phaser";
import {
    BOARD_COLS,
    BOARD_ROWS,
    GameManager
} from "./core/GameManager.js";
import { CellType } from "./core/Cell.js";
import { TurnPhase } from "./core/TurnManager.js";

import cardBack from "./assets/cardB.png";
import cardGold from "./assets/cardG.png";
import cardLose from "./assets/cardF.png";
import cardPass from "./assets/cardN.png";
import backgroundTile from "./assets/BackGround.png";

const PLAYER_RADIUS = 14;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image("cardBack", cardBack);
        this.load.image("cardGold", cardGold);
        this.load.image("cardLose", cardLose);
        this.load.image("cardPass", cardPass);
        this.load.image("backgroundTile", backgroundTile);
    }

    create() {
        this.drawBackground();

        this.gameManager = new GameManager();
        this.cardSprites = [];
        this.playerTokens = [];
        this.isAnimating = false;

        this.layout = this.computeLayout();
        this.drawHeader();
        this.drawBoard();
        this.drawPlayerTokens();
        this.drawRollButton();
        this.statusText = this.add.text(
            this.scale.width / 2,
            this.layout.statusY,
            this.gameManager.message,
            {
                fontSize: "18px",
                color: "#ecf0f1",
                align: "center",
                wordWrap: { width: this.scale.width - 32 }
            }
        ).setOrigin(0.5);
    }

    drawBackground() {
        const { width, height } = this.scale;

        this.background = this.add.tileSprite(0, 0, width, height, "backgroundTile")
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(-1);

        this.scale.on("resize", this.resizeBackground, this);
    }

    resizeBackground(gameSize) {
        this.background.setSize(gameSize.width, gameSize.height);
    }

    computeLayout() {
        const w = this.scale.width;
        const h = this.scale.height;
        const padding = 16;
        const headerH = 72;
        const footerH = 100;
        const cardGap = 8;

        const availableW = w - padding * 2;
        const availableH = h - headerH - footerH - padding * 2;
        const cellSize = Math.floor(
            Math.min(availableW / BOARD_COLS, availableH / BOARD_ROWS)
        );
        const cardSize = Math.max(cellSize - cardGap, 1);
        const boardWidth = cellSize * BOARD_COLS;
        const boardHeight = cellSize * BOARD_ROWS;
        const boardLeft = (w - boardWidth) / 2;
        const boardTop = headerH + (h - headerH - footerH - boardHeight) / 2;

        return {
            headerY: 36,
            statusY: h - footerH + 28,
            buttonY: h - footerH / 2 - 8,
            boardLeft,
            boardTop,
            cellSize,
            cardSize
        };
    }

    getCellCenter(col, row) {
        const { boardLeft, boardTop, cellSize } = this.layout;
        return {
            x: boardLeft + col * cellSize + cellSize / 2,
            y: boardTop + row * cellSize + cellSize / 2
        };
    }

    drawHeader() {
        const { headerY } = this.layout;
        const w = this.scale.width;

        this.add.text(w / 2, headerY - 18, "Шакал", {
            fontSize: "22px",
            color: "#f1c40f",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.goldTexts = this.gameManager.players.map((player, i) => {
            const x = i === 0 ? w * 0.25 : w * 0.75;
            return this.add.text(x, headerY + 14, `${player.name}: 0`, {
                fontSize: "16px",
                color: `#${player.color.toString(16).padStart(6, "0")}`
            }).setOrigin(0.5);
        });

        this.turnIndicator = this.add.text(w / 2, headerY + 40, "", {
            fontSize: "14px",
            color: "#bdc3c7"
        }).setOrigin(0.5);

        this.updateHeader();
    }

    drawBoard() {
        const gm = this.gameManager;
        const { cardSize } = this.layout;

        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const cell = gm.getCellAtGrid(col, row);
                const pathIdx = gm.getPathIndexForGrid(col, row);
                const { x: cx, y: cy } = this.getCellCenter(col, row);

                const sprite = this.add.image(cx, cy, "cardBack")
                    .setDisplaySize(cardSize, cardSize);

                const stepLabel = this.add.text(cx, cy - cardSize / 2 - 6, `${pathIdx + 1}`, {
                    fontSize: "11px",
                    color: "#7f8c8d"
                }).setOrigin(0.5);

                const overlay = this.add.text(cx, cy, "", {
                    fontSize: "13px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 2
                }).setOrigin(0.5).setVisible(false);

                this.cardSprites.push({ col, row, sprite, overlay, cell, stepLabel });
            }
        }
    }

    drawPlayerTokens() {
        this.gameManager.players.forEach((player, i) => {
            const token = this.add.circle(0, 0, PLAYER_RADIUS, player.color)
                .setStrokeStyle(2, 0xffffff);
            const label = this.add.text(0, 0, `${i + 1}`, {
                fontSize: "12px",
                color: "#ffffff",
                fontStyle: "bold"
            }).setOrigin(0.5);
            this.playerTokens.push({ token, label, playerId: player.id });
        });
        this.refreshTokenPositions();
    }

    drawRollButton() {
        const w = this.scale.width;
        const { buttonY } = this.layout;

        this.rollButton = this.add.rectangle(w / 2, buttonY, 200, 52, 0x27ae60)
            .setInteractive({ useHandCursor: true });

        this.rollLabel = this.add.text(w / 2, buttonY, "Бросить кубик", {
            fontSize: "18px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.diceText = this.add.text(w / 2, buttonY - 36, "", {
            fontSize: "28px",
            color: "#f39c12",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.rollButton.on("pointerdown", () => this.onRoll());
    }

    onRoll() {
        if (this.isAnimating) return;
        if (this.gameManager.turnManager.phase !== TurnPhase.ROLL) return;

        this.isAnimating = true;
        this.rollButton.setFillStyle(0x1e8449);
        this.diceText.setText("...");

        const roll = this.gameManager.roll();
        this.statusText.setText(this.gameManager.message);

        this.time.delayedCall(400, () => {
            this.diceText.setText(String(roll));
            this.animateMove(roll);
        });
    }

    animateMove(steps) {
        const gm = this.gameManager;
        const player = gm.turnManager.currentPlayer;
        const startPos = player.position;
        const targetPos = Math.min(startPos + steps, gm.path.length - 1);
        let visualPos = startPos;

        const moveOne = () => {
            if (visualPos >= targetPos) {
                gm.applyMove();
                this.refreshTokenPositions();
                this.time.delayedCall(300, () => this.resolveLanding());
                return;
            }

            visualPos++;
            this.refreshTokenPositionsForPlayer(player.id, visualPos);
            this.time.delayedCall(180, moveOne);
        };

        moveOne();
    }

    resolveLanding() {
        const result = this.gameManager.resolveCell();
        this.refreshCardVisual(result.cell);
        this.updateHeader();
        this.statusText.setText(this.gameManager.message);

        this.time.delayedCall(900, () => {
            this.gameManager.endTurn();
            this.updateHeader();
            this.statusText.setText(this.gameManager.message);
            this.diceText.setText("");
            this.rollButton.setFillStyle(0x27ae60);
            this.isAnimating = false;

            if (this.gameManager.turnManager.phase === TurnPhase.GAME_OVER) {
                this.rollButton.disableInteractive();
                this.rollLabel.setText("Игра окончена");
            }
        });
    }

    refreshCardVisual(cell) {
        if (!cell.isOpen) return;

        const entry = this.cardSprites.find((c) => c.cell === cell);
        if (!entry) return;

        entry.overlay.setVisible(true);
        entry.sprite.clearTint();

        if (cell.type === CellType.GOLD) {
            entry.sprite.setTexture("cardGold");
            entry.overlay.setText(`+${cell.value}`);
            entry.overlay.setColor("#f1c40f");
        } else if (cell.type === CellType.LOSE) {
            entry.sprite.setTexture("cardLose");
            entry.overlay.setText(`-${cell.value}`);
            entry.overlay.setColor("#e74c3c");
        } else {
            entry.sprite.setTexture("cardPass");
            entry.overlay.setVisible(false);
        }
    }

    refreshTokenPositions() {
        this.gameManager.players.forEach((player) => {
            this.refreshTokenPositionsForPlayer(player.id, player.position);
        });
    }

    refreshTokenPositionsForPlayer(playerId, position) {
        const gm = this.gameManager;
        const { cardSize } = this.layout;
        const boardIndex = gm.path[position];
        const col = boardIndex % BOARD_COLS;
        const row = Math.floor(boardIndex / BOARD_COLS);
        const { x: cx, y: cy } = this.getCellCenter(col, row);
        const offsetX = playerId === 0 ? -12 : 12;

        this.playerTokens
            .filter((t) => t.playerId === playerId)
            .forEach(({ token, label }) => {
                token.setPosition(cx + offsetX, cy + cardSize * 0.18);
                label.setPosition(cx + offsetX, cy + cardSize * 0.18);
            });
    }

    updateHeader() {
        const gm = this.gameManager;
        gm.players.forEach((player, i) => {
            this.goldTexts[i].setText(`${player.name}: ${player.gold} 🪙`);
        });

        if (gm.turnManager.phase === TurnPhase.GAME_OVER) {
            this.turnIndicator.setText("");
            return;
        }

        const current = gm.turnManager.currentPlayer;
        this.turnIndicator.setText(`Ход: ${current.name}`);
        this.goldTexts.forEach((t, i) => {
            t.setAlpha(i === gm.turnManager.currentIndex ? 1 : 0.5);
        });
    }
}
