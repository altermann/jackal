class TurnManager {
    constructor(players) {
        this.players = players;
        this.current = 0;
    }

    next() {
        this.current = (this.current + 1) % this.players.length;
        return this.players[this.current];
    }

    getCurrent() {
        return this.players[this.current];
    }
}