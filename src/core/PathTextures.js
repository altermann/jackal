const OPPOSITE = {
    left: "right",
    right: "left",
    up: "down",
    down: "up"
};

const CORNER_TEXTURES = {
    "left,down": "cardBackRightDown",
    "up,left": "cardBackDownLeft",
    "right,down": "cardBackLeftDown",
    "up,right": "cardBackDownRight"
};

function getGridPos(boardIndex, cols) {
    return {
        col: boardIndex % cols,
        row: Math.floor(boardIndex / cols)
    };
}

function getMoveDirection(fromIndex, toIndex, cols) {
    const from = getGridPos(fromIndex, cols);
    const to = getGridPos(toIndex, cols);
    const dc = to.col - from.col;
    const dr = to.row - from.row;

    if (dc > 0) return "right";
    if (dc < 0) return "left";
    if (dr > 0) return "down";
    if (dr < 0) return "up";
    return null;
}

export function getPathBackTexture(path, pathIndex, cols) {
    const current = path[pathIndex];
    const previous = pathIndex > 0 ? path[pathIndex - 1] : null;
    const next = pathIndex < path.length - 1 ? path[pathIndex + 1] : null;

    const enterFrom = previous != null
        ? OPPOSITE[getMoveDirection(previous, current, cols)]
        : null;
    const exitTo = next != null
        ? getMoveDirection(current, next, cols)
        : null;

    if (enterFrom == null || exitTo == null || enterFrom === exitTo) {
        return "cardBack";
    }

    return CORNER_TEXTURES[`${enterFrom},${exitTo}`] ?? "cardBack";
}
