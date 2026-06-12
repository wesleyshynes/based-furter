export const enemyData: {
    [key: string]: EnemyDataType;
} = {
    drifter: {
        type: 'drifter',
        radius: 0.5,
        collisionRadius: 0.5,
        speed: 2,
        health: 5,
        damage: 1,
        behaviorType: 'drift',
        pushbackForce: 0,
        pushbackImmune: true,

        color: 0xff0000,
    },
    seeker: {
        type: 'seeker',
        radius: 0.8,
        collisionRadius: 0.8,
        speed: 3,
        health: 3,
        damage: 2,
        behaviorType: 'seek',
        pushbackForce: 120,
        pushbackImmune: false,

        color: 0xffff00,
        // model: Wolf,
        // modelOptions: {
        //     scale: 3,
        // }
    }
}

export interface EnemyDataType {
    type: string;
    radius: number;
    collisionRadius: number;
    speed: number;
    health: number;
    damage: number;
    behaviorType: string;
    pushbackForce: number;
    pushbackImmune: boolean;
    
    color: number;
    model?: any;
    modelOptions?: {
        scale: number;
    }
}