import { GRID_SIZE, PLAYER_START_COORDS } from '../core/constants';
export class Player {

    x: number;
    y: number;
    z: number;

    radius: number;

    speed: number;

    constructor() {
        this.x = PLAYER_START_COORDS.x;
        this.y = PLAYER_START_COORDS.y;
        this.z = PLAYER_START_COORDS.z;

        this.radius = 0.5;
        this.speed = 5;
    }

    update(dt: number, keys: { [key: string]: boolean }) {

        let dx = 0, dy = 0, dz = 0;
        if (keys['w'] || keys['arrowup']) {
            dz -= this.speed;
        }
        if (keys['s'] || keys['arrowdown']) {
            dz += this.speed;
        }
        if (keys['a'] || keys['arrowleft']) {
            dx -= this.speed;
        }
        if (keys['d'] || keys['arrowright']) {
            dx += this.speed;
        }

        // Normalize diagonal movement
        if (dx !== 0 && dz !== 0) {
            const length = Math.sqrt(dx * dx + dz * dz);
            dx /= length;
            dz /= length;
            dx *= this.speed;
            dz *= this.speed;
        }

        this.x += dx * dt;
        this.y += dy * dt;
        this.z += dz * dt;

        // keep player in bounds of the grid
        this.x = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.x));
        this.z = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.z));
    }
}