import type { Enemy } from "../enemy";
import type { Player } from "../player";
import type { BehaviorType } from "./behaviorType";

export class SeekBehavior implements BehaviorType {
    update(enemy: Enemy, dt: number, player: Player) {
        const dx = player.x - enemy.x;
        const dz = player.z - enemy.z;
        const len = Math.sqrt(dx * dx + dz * dz);

        if (len > 0) {
            const moveX = (dx / len) * enemy.speed * dt;
            const moveZ = (dz / len) * enemy.speed * dt;

            enemy.x += moveX;
            enemy.z += moveZ;
        }
        // set angle based on movement direction
        if (dx !== 0 || dz !== 0) {
            enemy.angle = Math.atan2(dx, dz);
        }
    }
    reset() { }
}