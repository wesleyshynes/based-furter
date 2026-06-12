import { GRID_SIZE, PLAYER_START_COORDS, PUSHBACK_DECAY } from '../core/constants';
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
    collisionDamage: number;

    speed: number;
    moving: boolean;

    angle: number;

    pushbackForce: number;
    pushVx: number;
    pushVz: number;

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
        this.collisionDamage = playerData.collisionDamage;
        this.speed = playerData.speed;
        this.moving = false;
        this.angle = 0;

        this.pushbackForce = playerData.pushbackForce;
        this.pushVx = 0;
        this.pushVz = 0;
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
        this.pushVx = 0;
        this.pushVz = 0;
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

        if (this.pushVx !== 0 || this.pushVz !== 0) {
            this.x += this.pushVx * dt;
            this.z += this.pushVz * dt;

            const speed = Math.sqrt(this.pushVx * this.pushVx + this.pushVz * this.pushVz);
            const decay = PUSHBACK_DECAY * dt;
            if (speed <= decay) {
                this.pushVx = 0;
                this.pushVz = 0;
            } else {
                const ratio = (speed - decay) / speed;
                this.pushVx *= ratio;
                this.pushVz *= ratio;
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
            this.moving = true;
        } else {
            this.moving = false;
        }

        // keep player in bounds of the grid
        this.x = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.x));
        this.z = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.z));
    }

    applyPushback(dirX: number, dirZ: number, force: number) {
        this.pushVx = dirX * force;
        this.pushVz = dirZ * force;
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