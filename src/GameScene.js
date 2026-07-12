import Phaser from "phaser";
import {
    BOARD_COLS,
    BOARD_ROWS,
    GameManager
} from "./core/GameManager.js";
import { CellType } from "./core/Cell.js";
import { TurnPhase } from "./core/TurnManager.js";
import { getPathBackTexture } from "./core/PathTextures.js";

const PLAYER_TEXTURES = ["charP", "charT"];

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
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
    }

    getBoardCenter() {
        const { boardLeft, boardTop, cellSize } = this.layout;
        const boardWidth = cellSize * BOARD_COLS;
        const boardHeight = cellSize * BOARD_ROWS;

        return {
            x: boardLeft + boardWidth / 2,
            y: boardTop + boardHeight / 2,
            fontSize: Math.floor(cellSize * 1.35)
        };
    }

    showBoardMessage(text, color) {
        this.hideBoardMessage();

        const { x, y, fontSize } = this.getBoardCenter();
        this.boardMessageText = this.add.text(x, y, text, {
            fontSize: `${fontSize}px`,
            color,
            fontStyle: "bold"
        }).setOrigin(0.5).setAlpha(0).setDepth(25);

        this.tweens.add({
            targets: this.boardMessageText,
            alpha: 0.65,
            duration: 200,
            ease: "Sine.easeOut"
        });

        this.boardMessageTimer = this.time.delayedCall(900, () => {
            this.tweens.add({
                targets: this.boardMessageText,
                alpha: 0,
                duration: 250,
                onComplete: () => this.hideBoardMessage()
            });
        });
    }

    hideBoardMessage() {
        this.boardMessageTimer?.remove();
        this.boardMessageTimer = null;
        this.boardMessageText?.destroy();
        this.boardMessageText = null;
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
        this.background.setSize(gameSize.width, gameSize.height);
    }

    computeLayout() {
        const w = this.scale.width;
        const h = this.scale.height;
        const padding = 16;
        const headerH = 56;
        const footerH = 160;
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
        const boardTop = headerH + padding;

        return {
            headerY: 16,
            diceY: h - 110,
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

    getGridFromBoardIndex(boardIndex) {
        return {
            col: boardIndex % BOARD_COLS,
            row: Math.floor(boardIndex / BOARD_COLS)
        };
    }

    shouldFlipForRow(row) {
        return row % 2 === 1;
    }

    applyTokenFlip(token, row, animate) {
        const flipX = this.shouldFlipForRow(row);
        const entry = this.playerTokens.find((t) => t.token === token);
        const rowChanged = entry && entry.lastRow !== row;

        if (animate && rowChanged) {
            const targetScale = Math.abs(token.scaleX);
            this.tweens.add({
                targets: token,
                scaleX: 0,
                duration: 90,
                ease: "Power1",
                onComplete: () => {
                    token.setFlipX(flipX);
                    this.tweens.add({
                        targets: token,
                        scaleX: targetScale,
                        duration: 90,
                        ease: "Power1"
                    });
                }
            });
        } else {
            token.setFlipX(flipX);
        }

        if (entry) {
            entry.lastRow = row;
        }
    }

    drawHeader() {
        const { headerY } = this.layout;
        const w = this.scale.width;

        this.goldTexts = this.gameManager.players.map((player, i) => {
            const x = i === 0 ? w * 0.25 : w * 0.75;
            return this.add.text(x, headerY + 24, `${player.name}: 0`, {
                fontSize: "33px",
                color: `#${player.color.toString(16).padStart(6, "0")}`
            }).setOrigin(0.5);
        });

        this.diceHeaderText = this.add.text(w / 2, headerY + 24, "", {
            fontSize: "40px",
            color: "#ffeb3b",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.updateHeader();
    }

    setDiceDisplay(value) {
        const text = value === "" ? "" : String(value);
        this.diceText?.setText(text);
        this.diceHeaderText?.setText(text);
    }

    drawBoard() {
        const gm = this.gameManager;
        const { cardSize } = this.layout;

        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const cell = gm.getCellAtGrid(col, row);
                const pathIdx = gm.getPathIndexForGrid(col, row);
                const { x: cx, y: cy } = this.getCellCenter(col, row);
                const backTexture = pathIdx >= 0
                    ? getPathBackTexture(gm.path, pathIdx, BOARD_COLS)
                    : "cardBack";

                const sprite = this.add.image(cx, cy, backTexture)
                    .setDisplaySize(cardSize, cardSize);

                const stepLabel = this.add.text(cx - cardSize/3.5, cy + cardSize/3.5, `${pathIdx + 1}`, {
                    fontSize: "10px",
                    fontStyle: "bold",
                    color: "#7f8c8d"
                }).setOrigin(0.5);

                const overlay = this.add.text(cx, cy, "", {
                    fontSize: "13px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 2
                }).setOrigin(0.5).setVisible(false);

                this.cardSprites.push({
                    col,
                    row,
                    sprite,
                    overlay,
                    cell,
                    stepLabel,
                    backTexture
                });
            }
        }

        this.cardSprites.forEach(({ cell }) => {
            if (cell.isOpen) {
                this.refreshCardVisual(cell);
            }
        });
    }

    drawPlayerTokens() {
        const tokenSize = this.layout.cardSize * 0.42;

        this.gameManager.players.forEach((player, i) => {
            const token = this.add.image(0, 0, PLAYER_TEXTURES[i])
                .setDisplaySize(tokenSize, tokenSize)
                .setDepth(10);

            this.playerTokens.push({
                token,
                playerId: player.id,
                lastRow: null
            });
        });
        this.refreshTokenPositions();
    }

    drawRollButton() {
        const w = this.scale.width;
        const diceY = this.layout.diceY;

        this.diceButtonSize = Math.min(w * 0.216, 120);
        this.diceGlow = this.add.circle(
            w / 2,
            diceY,
            this.diceButtonSize * 0.48,
            0xe74c3c,
            1
        )
            .setAlpha(0)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setVisible(false);

        this.diceGlow.enableFilters();
        this.diceGlowBlur = this.diceGlow.filters.external.addBlur(1, 5, 5, 1);

        this.rollButton = this.add.image(w / 2, diceY, "dice")
            .setDisplaySize(this.diceButtonSize, this.diceButtonSize)
            .setInteractive({ useHandCursor: true })
            .setDepth(1);

        this.diceText = this.add.text(w / 2, diceY, "", {
            fontSize: `${Math.round(this.diceButtonSize * 0.38)}px`,
            color: "#ffeb3b",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(2);

        this.rollButton.on("pointerdown", () => this.onRoll());
        this.setRollButtonState("ready");
    }

    updateDicePlayerStyle() {
        if (!this.gameManager) return;

        const player = this.gameManager.turnManager.currentPlayer;
        this.rollButton?.setTint(player.color);
        this.diceGlow?.setFillStyle(player.color, 1);
    }

    startDiceIdleAnimation() {
        this.stopDiceIdleAnimation();

        const size = this.diceButtonSize;
        this.rollButton.setDisplaySize(size, size);
        this.updateDicePlayerStyle();

        this.diceButtonPulseTween = this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
            onUpdate: (tween) => {
                const pulse = tween.getValue();
                const buttonScale = 1 + pulse * 0.08;
                this.rollButton.setDisplaySize(
                    size * buttonScale,
                    size * buttonScale
                );
            }
        });

        this.diceGlow.setVisible(true);
        this.playDiceGlowFade(size);
    }

    playDiceGlowFade(size) {
        const baseRadius = size * 0.48;
        this.diceGlow.setRadius(baseRadius);
        this.diceGlow.setScale(1);
        this.diceGlow.setAlpha(0.55);

        this.diceGlowFadeTween = this.tweens.add({
            targets: this.diceGlow,
            scaleX: 2.15,
            scaleY: 2.15,
            alpha: 0,
            duration: 950,
            ease: "Sine.easeOut",
            onComplete: () => {
                if (this.diceGlow?.visible) {
                    this.playDiceGlowFade(size);
                }
            }
        });
    }

    stopDiceIdleAnimation() {
        if (this.diceButtonPulseTween) {
            this.diceButtonPulseTween.stop();
            this.diceButtonPulseTween.remove();
            this.diceButtonPulseTween = null;
        }

        if (this.diceGlowFadeTween) {
            this.diceGlowFadeTween.stop();
            this.diceGlowFadeTween.remove();
            this.diceGlowFadeTween = null;
        }

        this.tweens.killTweensOf(this.rollButton);
        this.tweens.killTweensOf(this.diceGlow);
        this.diceGlow?.setScale(1);
        this.diceGlow?.setVisible(false);
        this.diceGlow?.setAlpha(0);
    }

    setRollButtonState(state) {
        this.stopDiceIdleAnimation();

        const size = this.diceButtonSize;
        const scaleByState = {
            ready: 1,
            pressed: 1.12,
            waiting: 0.85
        };
        const tintByState = {
            ready: null,
            waiting: 0x666666
        };
        const alphaByState = {
            ready: 1,
            pressed: 1,
            waiting: 0.85
        };

        if (state === "ready") {
            this.updateDicePlayerStyle();
            this.rollButton.setAlpha(1);
            this.diceText?.setAlpha(1);
            this.startDiceIdleAnimation();
            return;
        }

        const scale = scaleByState[state] ?? 1;
        this.rollButton.setDisplaySize(size * scale, size * scale);

        if (state === "pressed") {
            this.updateDicePlayerStyle();
        } else {
            this.rollButton.setTint(tintByState[state] ?? 0xffffff);
        }

        this.rollButton.setAlpha(alphaByState[state] ?? 1);
        this.diceText?.setAlpha(alphaByState[state] ?? 1);
    }

    onRoll() {
        if (this.isAnimating) return;
        if (this.gameManager.turnManager.phase !== TurnPhase.ROLL) return;

        this.isAnimating = true;
        this.setRollButtonState("pressed");
        this.setDiceDisplay("...");

        const roll = this.gameManager.roll();

        this.time.delayedCall(200, () => {
            this.setRollButtonState("waiting");
            this.setDiceDisplay(roll);
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
            this.sound.play("jump2");
            this.refreshTokenPositionsForPlayer(player.id, visualPos, true);
            this.time.delayedCall(180, moveOne);
        };

        moveOne();
    }

    resolveLanding() {
        const result = this.gameManager.resolveCell();
        const player = this.gameManager.turnManager.currentPlayer;
        this.refreshCardVisual(result.cell);
        if (result.firstVisit && result.cell.type === CellType.GOLD) {
            this.showBoardMessage(`+${result.cell.value}`, "#ffeb3b");
            this.playGoldShine(result.cell);
            this.sound.play("getCoins");
        } else if (result.firstVisit && result.cell.type === CellType.LOSE) {
            this.showBoardMessage(`-${result.cell.value}`, "#e74c3c");
            this.sound.play("looseCoins");
        } else if (result.stepBack > 0) {
            this.showBoardMessage("Go back!", "#ecf0f1");
        }

        if (player.finished) {
            this.sound.play("bonus");
        }
        this.updateHeader();

        const finishTurn = () => {
            this.time.delayedCall(900, () => {
                this.gameManager.endTurn();
                this.updateHeader();
                this.setDiceDisplay("");
                this.isAnimating = false;

                if (this.gameManager.turnManager.phase === TurnPhase.GAME_OVER) {
                    this.rollButton.disableInteractive();
                    this.setRollButtonState("waiting");
                    this.time.delayedCall(1200, () => this.showGameOver());
                } else {
                    this.setRollButtonState("ready");
                }
            });
        };

        if (result.stepBack > 0) {
            this.animateStepBack(result.stepBack, finishTurn);
        } else {
            finishTurn();
        }
    }

    animateStepBack(steps, onComplete) {
        const gm = this.gameManager;
        const player = gm.turnManager.currentPlayer;
        const targetPos = player.position;
        let visualPos = targetPos + steps;

        const moveOne = () => {
            if (visualPos <= targetPos) {
                this.refreshTokenPositionsForPlayer(player.id, targetPos, true);
                onComplete();
                return;
            }

            visualPos--;
            this.sound.play("pushBack2");
            this.refreshTokenPositionsForPlayer(player.id, visualPos, true);
            this.time.delayedCall(180, moveOne);
        };

        moveOne();
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
        } else if (cell.type === CellType.BACK) {
            entry.sprite.setTexture("cardBackStep");
            entry.overlay.setVisible(false);
        } else if (cell.type === CellType.DOCK) {
            entry.sprite.setTexture("cardDock");
            entry.overlay.setVisible(false);
        } else {
            entry.sprite.setTexture("cardPass");
            entry.overlay.setVisible(false);
        }
    }

    playGoldShine(cell) {
        const entry = this.cardSprites.find((c) => c.cell === cell);
        if (!entry) return;

        const sprite = entry.sprite;
        const size = this.layout.cardSize;
        const half = size / 2;
        const baseScaleX = sprite.scaleX;
        const baseScaleY = sprite.scaleY;

        this.tweens.add({
            targets: sprite,
            scaleX: baseScaleX * 1.1,
            scaleY: baseScaleY * 1.1,
            duration: 160,
            yoyo: true,
            ease: "Back.easeOut"
        });

        const shine = this.add.rectangle(
            sprite.x - size,
            sprite.y,
            size * 0.35,
            size * 1.25,
            0xffffff,
            0.75
        )
            .setAngle(25)
            .setDepth(sprite.depth + 1)
            .setBlendMode(Phaser.BlendModes.ADD);

        shine.enableFilters();
        const [maskFilter] = Phaser.Actions.AddMaskShape(shine, {
            shape: "square",
            region: new Phaser.Geom.Rectangle(
                sprite.x - half,
                sprite.y - half,
                size,
                size
            )
        });

        this.tweens.add({
            targets: shine,
            x: sprite.x + size,
            alpha: 0,
            duration: 480,
            ease: "Sine.easeInOut",
            onComplete: () => {
                maskFilter?.destroy();
                shine.destroy();
            }
        });
    }

    refreshTokenPositions() {
        this.gameManager.players.forEach((player) => {
            this.refreshTokenPositionsForPlayer(player.id, player.position);
        });
    }

    refreshTokenPositionsForPlayer(playerId, position, animate = false) {
        const gm = this.gameManager;
        const { cardSize } = this.layout;
        const boardIndex = gm.path[position];
        const { col, row } = this.getGridFromBoardIndex(boardIndex);
        const { x: cx, y: cy } = this.getCellCenter(col, row);
        const offsetX = playerId === 0 ? -cardSize * 0.14 : cardSize * 0.14;
        const offsetY = playerId === 0 ? -cardSize * 0.14 : cardSize * 0.14;

        this.playerTokens
            .filter((t) => t.playerId === playerId)
            .forEach(({ token }) => {
                token.setPosition(cx + offsetX, cy + offsetY);
                this.applyTokenFlip(token, row, animate);
            });
    }

    updateHeader() {
        const gm = this.gameManager;
        gm.players.forEach((player, i) => {
            this.goldTexts[i].setText(`${player.name}: ${player.gold} 🪙`);
        });

        this.goldTexts.forEach((t, i) => {
            const isActive = gm.turnManager.phase !== TurnPhase.GAME_OVER
                && i === gm.turnManager.currentIndex;
            t.setAlpha(isActive ? 1 : 0.5);
        });
    }

    showGameOver() {
        const gm = this.gameManager;
        const winner = gm.winner;

        this.scene.start("GameOverScene", {
            winner: winner
                ? {
                    id: winner.id,
                    name: winner.name,
                    color: winner.color,
                    gold: winner.gold
                }
                : null,
            players: gm.players.map((player) => ({
                id: player.id,
                name: player.name,
                color: player.color,
                gold: player.gold
            }))
        });
    }
}
