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

const PLAYER_RADIUS = 14;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image("cardBack", cardBack);
        this.load.image("cardGold", cardGold);
    }

    create() {
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

    computeLayout() {
        const w = this.scale.width;
        const h = this.scale.height;
        const padding = 16;
        const headerH = 72;
        const footerH = 100;

        const boardW = w - padding * 2;
        const boardH = h - headerH - footerH - padding * 2;
        const cellW = Math.floor(boardW / BOARD_COLS);
        const cellH = Math.floor(boardH / BOARD_ROWS);
        const cardW = Math.min(cellW - 8, 72);
        const cardH = Math.min(cellH - 8, 96);

        const boardLeft = (w - cellW * BOARD_COLS) / 2;
        const boardTop = headerH + padding;

        return {
            headerY: 36,
            statusY: h - footerH + 28,
            buttonY: h - footerH / 2 - 8,
            boardLeft,
            boardTop,
            cellW,
            cellH,
            cardW,
            cardH
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

        this.turnIndicator = this.add.text(w / 2, headerY + 14, "", {
            fontSize: "14px",
            color: "#bdc3c7"
        }).setOrigin(0.5);

        this.updateHeader();
    }

    drawBoard() {
        const gm = this.gameManager;
        const { boardLeft, boardTop, cellW, cellH, cardW, cardH } = this.layout;

        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const cell = gm.getCellAtGrid(col, row);
                const pathIdx = gm.getPathIndexForGrid(col, row);
                const cx = boardLeft + col * cellW + cellW / 2;
                const cy = boardTop + row * cellH + cellH / 2;

                const sprite = this.add.image(cx, cy, "cardBack")
                    .setDisplaySize(cardW, cardH);

                const stepLabel = this.add.text(cx, cy - cardH / 2 - 6, `${pathIdx + 1}`, {
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

        if (cell.type === CellType.GOLD) {
            entry.sprite.setTexture("cardGold");
            entry.overlay.setText(`+${cell.value}`);
            entry.overlay.setColor("#f1c40f");
        } else if (cell.type === CellType.LOSE) {
            entry.sprite.setTexture("cardBack");
            entry.sprite.setTint(0xff6666);
            entry.overlay.setText(`-${cell.value}`);
            entry.overlay.setColor("#e74c3c");
        } else {
            entry.sprite.setTexture("cardBack");
            entry.sprite.setTint(0x888888);
            entry.overlay.setText("—");
            entry.overlay.setColor("#bdc3c7");
        }
    }

    refreshTokenPositions() {
        this.gameManager.players.forEach((player) => {
            this.refreshTokenPositionsForPlayer(player.id, player.position);
        });
    }

    refreshTokenPositionsForPlayer(playerId, position) {
        const gm = this.gameManager;
        const { boardLeft, boardTop, cellW, cellH } = this.layout;
        const boardIndex = gm.path[position];
        const col = boardIndex % BOARD_COLS;
        const row = Math.floor(boardIndex / BOARD_COLS);
        const cx = boardLeft + col * cellW + cellW / 2;
        const cy = boardTop + row * cellH + cellH / 2;
        const offsetX = playerId === 0 ? -12 : 12;

        this.playerTokens
            .filter((t) => t.playerId === playerId)
            .forEach(({ token, label }) => {
                token.setPosition(cx + offsetX, cy + cellH * 0.28);
                label.setPosition(cx + offsetX, cy + cellH * 0.28);
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
