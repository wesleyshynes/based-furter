export const enemyData: {
    [key: string]: EnemyDataType;
} = {
    drifter: {
        type: 'drifter',
        radius: 0.5,
        speed: 2,
        health: 1,
        damage: 1,
        color: 0xff0000,
        behaviorType: 'drift'
    },
    seeker: {
        type: 'seeker',
        radius: 0.8,
        speed: 3,
        health: 1,
        damage: 1,
        color: 0xffff00,
        behaviorType: 'seek'
    }
}

export interface EnemyDataType {
    type: string;
    radius: number;
    speed: number;
    health: number;
    damage: number;
    color: number;
    behaviorType: string;
}