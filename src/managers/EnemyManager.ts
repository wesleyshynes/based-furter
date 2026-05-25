import { enemyData } from "../data/enemyData";
import { Enemy } from "../entities/enemy";
import { ObjectPooler } from "../utils/objectPooler";

export class EnemyManager {
    pool: ObjectPooler<Enemy>;

    constructor() {
        const ENEMY_POOL_SIZE = 10;

        this.pool = new ObjectPooler((id: number) => {
            return new Enemy(enemyData.drifter, id);
        }, ENEMY_POOL_SIZE);
    }

    spawn(x: number, z: number) {
        const enemy = this.pool.get();
        enemy.spawn(x, z);
    }

    getActiveEnemies() {
        return this.pool.active;
    }

    update(dt: number, player: { x: number; y: number; z: number }) {
        this.pool.updateAll(dt, player);
    }
    reset() {
        this.pool.releaseAll();
    }
}