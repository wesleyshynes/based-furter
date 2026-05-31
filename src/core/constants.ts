export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GAME_MARGIN = 15;

export const ASPECT_RATIO = 16 / 9;

export const GRID_SIZE = 40;
export const GRID_DIVISIONS = 40;

export const PLAYER_START_COORDS = { x: 2, y: 0.5, z: -4 };

export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
}

export const ENEMY_DESPAWN_DISTANCE = 50;
export const ENEMY_SPAWN_DISTANCE = 30;
export const ENEMY_SPAWN_INTERVAL = 2;

export const EVENTS = {
    // Audio
    SOUND: 'sound',
    // Game State
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_RETURN_TO_MENU: 'game:returnToMenu',
    // Player
    PLAYER_DAMAGED: 'player:damaged',
    PLAYER_DIED: 'player:died',
    // Enemy
    ENEMY_DAMAGED: 'enemy:damaged',
    ENEMY_DIED: 'enemy:died',
}