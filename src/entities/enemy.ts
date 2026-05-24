import { GRID_SIZE } from "../core/constants";
import type { EnemyDataType } from "../data/enemyData";

export class Enemy {
    x: number;
    y: number;
    z: number;

    radius: number;
    speed: number;
    damage: number;
    health: number;
    color: string;

    private data: EnemyDataType;

    constructor(data: EnemyDataType) {
        this.data = data;

        this.x = 0;
        this.y = 0.5;
        this.z = 0;

        this.radius = data.radius;
        this.speed = data.speed;
        this.damage = data.damage;
        this.health = data.health;
        this.color = data.color;
    }

    spawn(x: number, z: number) {
        this.x = x;
        this.z = z;
        this.health = this.data.health;
    }

    update(dt: number, player: { x: number; y: number; z: number }) {
        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const len = Math.sqrt(dx * dx + dz * dz);

        if (len > 0) {
            const moveX = (dx / len) * this.speed * dt;
            const moveZ = (dz / len) * this.speed * dt;

            this.x += moveX;
            this.z += moveZ;
        }
    }
}