import { ENEMY_DESPAWN_DISTANCE, ENEMY_HIT_INVINCIBILITY_DURATION, PUSHBACK_DECAY } from "../core/constants";
import type { EnemyDataType } from "../data/enemyData";
import type { BehaviorType } from "./behaviors/behaviorType";

export class Enemy {

    id: string;

    x: number;
    y: number;
    z: number;

    angle: number;

    radius: number;
    collisionRadius: number;
    speed: number;
    damage: number;
    health: number;
    color: number;

    active: boolean;
    invincible: boolean;
    invincibilityTimer: number;

    pushVx: number;
    pushVz: number;

    data: EnemyDataType;
    private behavior: BehaviorType;
    type: string

    constructor(id: string, data: EnemyDataType, behavior: BehaviorType) {
        this.id = id;
        this.data = data;
        this.behavior = behavior;
        this.type = data.type;

        this.x = 0;
        this.y = 0.5;
        this.z = 0;

        this.angle = 0;

        this.radius = data.radius;
        this.collisionRadius = data.collisionRadius;
        this.speed = data.speed;
        this.damage = data.damage;
        this.health = data.health;
        this.color = data.color;

        this.active = false;
        this.invincible = false;
        this.invincibilityTimer = 0;

        this.pushVx = 0;
        this.pushVz = 0;
    }

    spawn(x: number, z: number) {
        this.x = x;
        this.z = z;
        this.health = this.data.health;
        this.active = true;
    }

    reset() {
        this.health = this.data.health;
        this.active = false;
        this.pushVx = 0;
        this.pushVz = 0;
        this.behavior.reset();
    }

    update(dt: number, player: { x: number; y: number; z: number }) {
        if (!this.active) return;

        if (this.invincible) {
            this.invincibilityTimer -= dt;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
                this.invincibilityTimer = 0;
            }
        }

        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const len = Math.sqrt(dx * dx + dz * dz);

        // apply pushback velocity and decay
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

        // despawn if too far from player
        if (len > ENEMY_DESPAWN_DISTANCE) {
            this.active = false;
            return;
        }

        this.behavior.update(this, dt, player);
    }

    applyPushback(dirX: number, dirZ: number, force: number) {
        this.pushVx = dirX * force;
        this.pushVz = dirZ * force;
    }

    takeDamage(amount: number) {
        if (this.invincible) return false;

        this.health = Math.max(0, this.health - amount);

        this.invincible = true;
        this.invincibilityTimer = ENEMY_HIT_INVINCIBILITY_DURATION;

        return true;
    }

    isDead() {
        return this.health <= 0;
    }
}