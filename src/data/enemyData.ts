export const enemyData: {
    [key: string]: EnemyDataType;
} = {
    drifter: {
        type: 'drifter',
        radius: 0.5,
        collisionRadius: 0.5,
        speed: 2,
        health: 1,
        damage: 1,
        behaviorType: 'drift',

        color: 0xff0000,
    },
    seeker: {
        type: 'seeker',
        radius: 0.8,
        collisionRadius: 0.8,
        speed: 3,
        health: 100,
        damage: 1,
        behaviorType: 'seek',

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
    
    color: number;
    model?: any;
    modelOptions?: {
        scale: number;
    }
}