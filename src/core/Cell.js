export const CellType = {
    GOLD: "gold",
    LOSE: "lose",
    PASS: "pass",
    BACK: "back",
    DOCK: "dock"
};

export class Cell {
    constructor(type, value = 0) {
        this.type = type;
        this.value = value;
        this.isOpen = false;
    }

    reveal() {
        this.isOpen = true;
    }
}

export function createBoardDeck(size) {
    const deck = [];
    const goldCount = Math.floor(size * 0.35);
    const loseCount = Math.floor(size * 0.2);
    const backCount = Math.max(2, Math.floor(size * 0.1));
    const passCount = size - goldCount - loseCount - backCount;

    for (let i = 0; i < goldCount; i++) {
        deck.push(new Cell(CellType.GOLD, i % 3 === 0 ? 2 : 1));
    }
    for (let i = 0; i < loseCount; i++) {
        deck.push(new Cell(CellType.LOSE, 1));
    }
    for (let i = 0; i < backCount; i++) {
        deck.push(new Cell(CellType.BACK, 1));
    }
    for (let i = 0; i < passCount; i++) {
        deck.push(new Cell(CellType.PASS, 0));
    }

    shuffle(deck);
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
