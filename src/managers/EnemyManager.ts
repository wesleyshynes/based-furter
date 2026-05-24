import { enemyData } from "../data/enemyData";
import { Enemy } from "../entities/enemy";

export class EnemyManager {
    private enemy: Enemy;

    constructor() {
        this.enemy = new Enemy(enemyData.drifter);
    }

    spawn(x: number, z: number) {
        this.enemy.spawn(x, z);
    }

    getActiveEnemies() {
        return [this.enemy];
    }

    update(dt: number, player: { x: number; y: number; z: number }) {
        this.enemy.update(dt, player);
    }
}