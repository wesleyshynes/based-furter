import Animated_Robot from '../assets/models/glb/Animated_Robot.glb';
import Low_Poly_Person from '../assets/models/fbx/low-poly-person.fbx';
import Low_Poly_Person_Animated from '../assets/models/glb/low-poly-person-animated.glb';

export const playerData = {
    maxHealth: 12,
    radius: 0.5,
    speed: 5,
    collisionRadius: 0.5,
    invincibilityDuration: 2, // seconds

    model: Low_Poly_Person_Animated,
    // model: Low_Poly_Person,
    // model: Animated_Robot,
    modelOptions: {
        scale: 2,
        // scale: 0.02,
        // scale: 0.5,
    }
}

export const missionData = {
    killCount: 10,
    surviveTime: 60, // seconds
}