import { createBoardDeck, CellType, Cell } from "./Cell.js";
import { Dice } from "./Dice.js";
import { Player } from "./Player.js";
import { TurnManager, TurnPhase } from "./TurnManager.js";

export const BOARD_COLS = 4;
export const BOARD_ROWS = 6;
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;

export class GameManager {
    constructor() {
        this.board = createBoardDeck(BOARD_SIZE);
        this.path = buildSnakePath(BOARD_COLS, BOARD_ROWS);
        this.setupBoundaryCells();
        this.players = [
            new Player(0, "Игрок 1", 0xe74c3c),
            new Player(1, "Игрок 2", 0x3498db)
        ];
        this.turnManager = new TurnManager(this.players);
        this.message = "Бросьте кубик";
        this.winner = null;
    }

    roll() {
        if (this.turnManager.phase !== TurnPhase.ROLL) {
            return null;
        }

        const value = Dice.roll();
        this.turnManager.rollDice(value);
        this.message = `Выпало ${value}. Движение...`;
        return value;
    }

    applyMove() {
        const player = this.turnManager.currentPlayer;
        const newPos = Math.min(
            player.position + this.turnManager.lastRoll,
            this.path.length - 1
        );
        player.position = newPos;

        if (newPos >= this.path.length - 1) {
            player.finished = true;
        }

        this.turnManager.beginResolve();
        return newPos;
    }

    resolveCell() {
        const player = this.turnManager.currentPlayer;
        const cellIndex = this.path[player.position];
        const cell = this.board[cellIndex];
        const firstVisit = !cell.isOpen;

        if (firstVisit) {
            cell.reveal();
        }

        let delta = 0;
        let stepBack = 0;

        if (cell.type === CellType.BACK) {
            const fromPos = player.position;
            player.position = Math.max(0, player.position - cell.value);
            stepBack = fromPos - player.position;
            if (player.position < this.path.length - 1) {
                player.finished = false;
            }
            this.message = stepBack > 0 ? "Шаг назад!" : "Некуда отступать";
        } else if (firstVisit) {
            if (cell.type === CellType.GOLD) {
                delta = cell.value;
                player.addGold(delta);
                this.message = `+${delta} золота!`;
            } else if (cell.type === CellType.LOSE) {
                delta = -cell.value;
                player.addGold(delta);
                this.message = `-${cell.value} золота!`;
            } else if (cell.type === CellType.DOCK) {
                this.message = "Пристань";
            } else {
                this.message = "Пусто — без изменений";
            }
        } else {
            this.message = "Клетка уже открыта";
        }

        return { cell, delta, firstVisit, stepBack };
    }

    endTurn() {
        if (this.turnManager.allFinished()) {
            this.turnManager.phase = TurnPhase.GAME_OVER;
            this.winner = this.getWinner();
            this.message = this.winner
                ? `${this.winner.name} победил!`
                : "Ничья!";
            return null;
        }

        const next = this.turnManager.nextTurn();
        if (next) {
            this.message = `${next.name}: бросьте кубик`;
        } else {
            this.winner = this.getWinner();
            this.message = this.winner
                ? `${this.winner.name} победил!`
                : "Ничья!";
        }
        return next;
    }

    getWinner() {
        const [p1, p2] = this.players;
        if (p1.gold > p2.gold) return p1;
        if (p2.gold > p1.gold) return p2;
        return null;
    }

    getCellAtGrid(col, row) {
        const index = row * BOARD_COLS + col;
        return this.board[index];
    }

    getPathIndexForGrid(col, row) {
        const boardIndex = row * BOARD_COLS + col;
        return this.path.indexOf(boardIndex);
    }

    setupBoundaryCells() {
        const startIndex = this.path[0];
        const endIndex = this.path[this.path.length - 1];

        [startIndex, endIndex].forEach((boardIndex) => {
            const cell = new Cell(CellType.DOCK, 0);
            cell.reveal();
            this.board[boardIndex] = cell;
        });
    }
}

function buildSnakePath(cols, rows) {
    const path = [];
    for (let row = 0; row < rows; row++) {
        if (row % 2 === 0) {
            for (let col = 0; col < cols; col++) {
                path.push(row * cols + col);
            }
        } else {
            for (let col = cols - 1; col >= 0; col--) {
                path.push(row * cols + col);
            }
        }
    }
    return path;
}
