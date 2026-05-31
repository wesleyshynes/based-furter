import { GRID_SIZE, PLAYER_START_COORDS } from '../core/constants';
import { playerData } from '../data/playerData';
export class Player {

    x: number;
    y: number;
    z: number;

    health: number;
    maxHealth: number;

    radius: number;
    collisionRadius: number;

    speed: number;

    angle: number;

    constructor() {
        this.x = PLAYER_START_COORDS.x;
        this.y = PLAYER_START_COORDS.y;
        this.z = PLAYER_START_COORDS.z;

        this.maxHealth = playerData.maxHealth;
        this.health = this.maxHealth;

        this.radius = playerData.radius;
        this.collisionRadius = playerData.collisionRadius;
        this.speed = playerData.speed;
        this.angle = 0;
    }

    reset() {
        this.x = PLAYER_START_COORDS.x;
        this.y = PLAYER_START_COORDS.y;
        this.z = PLAYER_START_COORDS.z;
        this.health = playerData.maxHealth;
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

        // set the angle based on movement direction
        if (dx !== 0 || dz !== 0) {
            this.angle = Math.atan2(dx, dz);
        }

        // keep player in bounds of the grid
        this.x = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.x));
        this.z = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.z));
    }

    takeDamage(amount: number) {
        this.health = Math.max(0, this.health - amount);
        return true;
    }
}