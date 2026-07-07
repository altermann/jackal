handleTurn() {
    const player = this.turnManager.getCurrent();

    if (player.skipTurn) {
        player.skipTurn = false;
        this.turnManager.next();
        return;
    }

    const roll = rollDice();

    for (let i = 0; i < roll; i++) {
        player.position++;
        this.resolveCell(player);
    }

    this.turnManager.next();
}

resolveCell(player) {
    const cell = this.board[player.position];

    if (!cell.isOpen) {
        cell.isOpen = true;
    }

    switch (cell.type) {
        case "GOLD":
            player.gold++;
            break;

        case "SKIP":
            player.skipTurn = true;
            break;

        case "TRAP":
            player.gold = Math.max(0, player.gold - 1);
            break;

        case "MOVE":
            player.position = cell.data; // телепорт
            break;
    }
}

if (totalGoldCollected >= 7) {
    endGame();
}