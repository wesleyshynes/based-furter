export class BehaviorType {
    update(enemy: any, dt: number, player: any) {
        // This method should be overridden by specific behavior implementations
    }
    reset() {
        // This method can be overridden to reset any internal state when an enemy is respawned
    }
}