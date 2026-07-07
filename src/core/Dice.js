class Cell {
    constructor(type, data = null) {
        this.type = type;
        this.data = data; // например targetIndex для MOVE
        this.isOpen = false;
    }
}