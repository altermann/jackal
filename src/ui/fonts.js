export const GAME_FONT = "Audex";

export function gameTextStyle(style = {}) {
    return {
        fontFamily: GAME_FONT,
        ...style
    };
}
