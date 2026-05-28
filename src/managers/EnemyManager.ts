import { enemyData } from "../data/enemyData";
import { BehaviorFactory } from "../entities/behaviors/behaviorFactory";
import { Enemy } from "../entities/enemy";
import { ObjectPooler } from "../utils/objectPooler";

export class EnemyManager {

    pools: { [key: string]: ObjectPooler<Enemy> };

    constructor() {
        const ENEMY_POOL_SIZE = 10;

        this.pools = {};

        for (const type in enemyData) {
            this.pools[type] = new ObjectPooler((id: number) => {
                const data = enemyData[type];
                const behavior = BehaviorFactory.create(data.behaviorType);
                return new Enemy(`${id}`, data, behavior);
            }, ENEMY_POOL_SIZE);
        }
    }

    spawn(type: string, x: number, z: number) {
        const pool = this.pools[type];
        if (!pool) {
            console.log(`Unknown enemy type: ${type}`);
            return null;
        }
        const enemy = pool.get();
        enemy.spawn(x, z);
        return enemy;
    }

    getActiveEnemies() {
        const enemies: Enemy[] = [];
        for (const type in this.pools) {
            enemies.push(...this.pools[type].active);
        }
        return enemies;
    }

    update(dt: number, player: { x: number; y: number; z: number }) {
        for (const type in this.pools) {
            this.pools[type].updateAll(dt, player);
        }
    }
    reset() {
        for (const type in this.pools) {
            this.pools[type].releaseAll();
        }
    }
}