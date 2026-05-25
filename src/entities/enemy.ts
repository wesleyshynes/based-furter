import { ENEMY_DESPAWN_DISTANCE } from "../core/constants";
import type { EnemyDataType } from "../data/enemyData";

export class Enemy {

    id: number;

    x: number;
    y: number;
    z: number;

    radius: number;
    speed: number;
    damage: number;
    health: number;
    color: string;

    active: boolean;

    private data: EnemyDataType;

    constructor(data: EnemyDataType, id: number) {
        this.data = data;
        this.id = id;

        this.x = 0;
        this.y = 0.5;
        this.z = 0;

        this.radius = data.radius;
        this.speed = data.speed;
        this.damage = data.damage;
        this.health = data.health;
        this.color = data.color;

        this.active = false;
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
    }

    update(dt: number, player: { x: number; y: number; z: number }) {
        if (!this.active) return;

        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        
        // despawn if too far from player
        if (len > ENEMY_DESPAWN_DISTANCE) {
            this.active = false;
            return;
        }

        if (len > 0) {
            const moveX = (dx / len) * this.speed * dt;
            const moveZ = (dz / len) * this.speed * dt;

            this.x += moveX;
            this.z += moveZ;
        }
    }
}