export const TurnPhase = {
    ROLL: "roll",
    MOVING: "moving",
    RESOLVE: "resolve",
    GAME_OVER: "game_over"
};

export class TurnManager {
    constructor(players) {
        this.players = players;
        this.currentIndex = 0;
        this.phase = TurnPhase.ROLL;
        this.lastRoll = 0;
    }

    get currentPlayer() {
        return this.players[this.currentIndex];
    }

    rollDice(value) {
        this.lastRoll = value;
        this.phase = TurnPhase.MOVING;
        return value;
    }

    beginResolve() {
        this.phase = TurnPhase.RESOLVE;
    }

    nextTurn() {
        const startIndex = this.currentIndex;
        do {
            this.currentIndex = (this.currentIndex + 1) % this.players.length;
            if (!this.players[this.currentIndex].finished) {
                this.phase = TurnPhase.ROLL;
                this.lastRoll = 0;
                return this.currentPlayer;
            }
        } while (this.currentIndex !== startIndex);

        this.phase = TurnPhase.GAME_OVER;
        return null;
    }

    allFinished() {
        return this.players.every((p) => p.finished);
    }
}
