export class CollisionSystem {
    checkCircleCircle(
        a: { x: number, y: number, radius: number },
        b: { x: number, y: number, radius: number }
    ): boolean {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSq = dx * dx + dy * dy
        const radiusSum = a.radius + b.radius;
        return distanceSq <= radiusSum * radiusSum;
    }

    checkCircleCircleZ(
        a: { x: number, y: number, z: number, radius: number },
        b: { x: number, y: number, z: number, radius: number }
    ): boolean {
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        const distanceSq = dx * dx + dz * dz;
        const radiusSum = a.radius + b.radius;
        return distanceSq <= radiusSum * radiusSum;
    }
}