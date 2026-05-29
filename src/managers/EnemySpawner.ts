import { ENEMY_SPAWN_INTERVAL, GRID_SIZE } from "../core/constants";
import { enemyData } from "../data/enemyData";
import type { EnemyManager } from "./EnemyManager";

export class EnemySpawner {

    private enemyManager: EnemyManager;
    private spawnTimer: number;
    private spawnInterval: number;

    private enemyTypes: string[];

    constructor(enemyManager: EnemyManager) {
        this.enemyManager = enemyManager;
        this.spawnTimer = 0;
        this.spawnInterval = ENEMY_SPAWN_INTERVAL;
        // Cache enemy types from the data
        this.enemyTypes = []
        for (const type in enemyData) {
            this.enemyTypes.push(type);
        }
    }
    update(dt: number) {
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnWave();
            this.spawnTimer = 0;
        }
    }
    spawnWave() {
        // pick a random enemy type from the cached list
        const type = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        // spawn at random edge of the map
        const edge = Math.floor(Math.random() * 4);
        let x = 0, z = 0;

        const gridSize = GRID_SIZE

        switch (edge) {
            case 0: // top
                x = (Math.random() - 0.5) * gridSize;
                z = -gridSize / 2;
                break;
            case 1: // right
                x = gridSize / 2;
                z = (Math.random() - 0.5) * gridSize;
                break;
            case 2: // bottom
                x = (Math.random() - 0.5) * gridSize;
                z = gridSize / 2;
                break;
            case 3: // left
                x = -gridSize / 2;
                z = (Math.random() - 0.5) * gridSize;
                break;
        }
        this.enemyManager.spawn(type, x, z);

    }
    reset() {
        this.spawnTimer = 0;
    }
}