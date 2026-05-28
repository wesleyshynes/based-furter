import type { BehaviorType } from "./behaviorType";

export class DriftBehavior implements BehaviorType {

    angle: number;
    changeTimer: number;
    changeInterval: number;

    constructor() {
        this.angle = Math.random() * 2 * Math.PI; // Random initial angle
        this.changeTimer = 0;
        this.changeInterval = 2 
    }

    update(enemy: any, dt: number, player: any) {
        this.changeTimer += dt;

        if (this.changeTimer >= this.changeInterval) {
            this.angle = Math.random() * 2 * Math.PI; // Change to a new random angle
            this.changeTimer = 0;
        }

        const dX = Math.cos(this.angle);
        const dZ = Math.sin(this.angle);

        enemy.x += dX * enemy.speed * dt;
        enemy.z += dZ * enemy.speed * dt;
    }
    reset() {
        this.angle = Math.random() * 2 * Math.PI;
        this.changeTimer = 0;
    }
}