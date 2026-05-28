import { DriftBehavior } from "./driftBehavior";
import { SeekBehavior } from "./seekBehavior";

export class BehaviorFactory {
    static create(behaviorType: string) {
        switch (behaviorType) {
            case "seek":
                return new SeekBehavior();
            case "drift":
                return new DriftBehavior();
            default:
                console.log(`Unknown behavior type: ${behaviorType}, defaulting to seek behavior.`);
                return new SeekBehavior();
        }
    }
}