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
            if (!enemy.active) continue; // Skip if enemy is already inactive
            if (this.collisionSystem.checkCircleCircleZ(player, enemy)) {
                const dx = player.x - enemy.x;
                const dz = player.z - enemy.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                const nx = distance > 0 ? dx / distance : 1;
                const nz = distance > 0 ? dz / distance : 0;

                const enemyDamageApplied = enemy.takeDamage(player.collisionDamage);
                if (enemyDamageApplied) {
                    this.events.emit(EVENTS.ENEMY_DAMAGED, enemy);
                    if (enemy.isDead()) {
                        enemy.active = false;
                        this.events.emit(EVENTS.ENEMY_DIED, enemy);
                    } else if (!enemy.data.pushbackImmune) {
                        enemy.applyPushback(-nx, -nz, enemy.data.pushbackForce);
                    }
                }

                const playerDamageApplied = player.takeDamage(enemy.damage);
                if (playerDamageApplied) {
                    this.events.emit(EVENTS.PLAYER_DAMAGED, player.health, player.maxHealth);
                    if (player.isDead()) {
                        this.events.emit(EVENTS.PLAYER_DIED);
                        return; // No need to check further if player is dead
                    }
                    if (enemy.data.pushbackImmune) {
                        player.applyPushback(nx, nz, player.pushbackForce);
                    }
                }
            }
        }
    }
}
