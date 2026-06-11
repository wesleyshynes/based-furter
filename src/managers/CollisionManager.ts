import { EVENTS } from "../core/constants";
import type { EventEmitter } from "../core/eventEmitter";
import type { Enemy } from "../entities/enemy";
import type { Player } from "../entities/player";
import type { CollisionSystem } from "../systems/collisionSystem";

export class CollisionManager {

    private collisionSystem: CollisionSystem;
    private events: EventEmitter;

    constructor(collisionSystem: CollisionSystem, events: EventEmitter) {
        this.collisionSystem = collisionSystem;
        this.events = events;
    }

    update(player: Player, enemies: Enemy[]) {
        this.checkPlayerVsEnemies(player, enemies);
    }

    checkPlayerVsEnemies(player: Player, enemies: Enemy[]) {
        for (const enemy of enemies) {
            if (this.collisionSystem.checkCircleCircleZ(player, enemy)) {
                if (!enemy.active) continue; // Skip if enemy is already inactive
                
                const enemyDamageApplied = enemy.takeDamage(player.collisionDamage);
                if (enemyDamageApplied) {
                    this.events.emit(EVENTS.ENEMY_DAMAGED, enemy);
                    if (enemy.isDead()) {
                        enemy.active = false;
                        this.events.emit(EVENTS.ENEMY_DIED, enemy);
                    }
                }

                const playerDamageApplied = player.takeDamage(enemy.damage);
                if (playerDamageApplied) {
                    this.events.emit(EVENTS.PLAYER_DAMAGED, player.health, player.maxHealth);
                    if (player.isDead()) {
                        this.events.emit(EVENTS.PLAYER_DIED);
                        return; // No need to check further if player is dead
                    }
                }
            }
        }
    }
}
