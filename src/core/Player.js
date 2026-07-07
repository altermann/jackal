export class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.position = 0;
        this.gold = 0;
        this.finished = false;
    }

    addGold(amount) {
        this.gold = Math.max(0, this.gold + amount);
    }
}
