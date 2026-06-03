import { GRID_SIZE, PLAYER_START_COORDS } from '../core/constants';
import { playerData } from '../data/playerData';
export class Player {

    x: number;
    y: number;
    z: number;

    health: number;
    maxHealth: number;

    invincible: boolean;
    invincibilityTimer: number;
    invincibilityDuration: number; // seconds

    redMode: boolean;

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

        this.invincible = false;
        this.invincibilityTimer = 0;
        this.invincibilityDuration = playerData.invincibilityDuration;

        this.redMode = false;

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
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.angle = 0;
        this.redMode = false;
    }

    update(dt: number, input: {
        keys: { [key: string]: boolean }
        direction: { x: number, z: number }
    }) {

        const keys = input.keys;
        const direction = input.direction;

        if (this.invincible) {
            this.invincibilityTimer -= dt;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
                this.invincibilityTimer = 0;
            }
        }

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

        if (direction.x !== 0 || direction.z !== 0) {
            dx += direction.x * this.speed;
            dz -= direction.z * this.speed;
        }

        if (keys[' ']) {
            this.redMode = true;
        } else {
            this.redMode = false;
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
        if (this.invincible) return false;

        this.health = Math.max(0, this.health - amount);

        this.invincible = true;
        this.invincibilityTimer = this.invincibilityDuration;

        return true;
    }

    isDead() {
        return this.health <= 0;
    }
}