export const enemyData: {
    [key: string]: EnemyDataType;
} = {
    drifter: {
        radius: 0.5,
        speed: 2,
        health: 1,
        damage: 1,
        color: 'red',
    }
}

export interface EnemyDataType {
    radius: number;
    speed: number;
    health: number;
    damage: number;
    color: string;
}