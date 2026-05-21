import * as THREE from 'three';
import { GRID_SIZE, PLAYER_START_COORDS } from '../core/constants';

export class Player {

    x: number;
    y: number;
    z: number;

    radius: number;

    speed: number;

    object3d: THREE.Object3D;

    constructor() {
        this.x = PLAYER_START_COORDS.x;
        this.y = PLAYER_START_COORDS.y;
        this.z = PLAYER_START_COORDS.z;

        this.radius = 0.5;
        this.speed = 5;

        // Create a simple sphere to represent the player
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.object3d = new THREE.Mesh(geometry, material);
        this.object3d.position.set(this.x, this.y, this.z);
        this.object3d.castShadow = true;
    }

    update(dt: number, keys: { [key: string]: boolean }) {

        let dx = 0, dy = 0, dz = 0;
        if (keys['w'] || keys['arrowup']) {
            dz -= this.speed;
        }
        if (keys['s'] || keys['arrowdown']) {
            dz += this.speed;
        }
        if (keys['a'] || keys['arrowleft']) {
            dx -= this.speed;
        }
        if (keys['d'] || keys['arrowright']) {
            dx += this.speed;
        }

        // Normalize diagonal movement
        if (dx !== 0 && dz !== 0) {
            const length = Math.sqrt(dx * dx + dz * dz);
            dx /= length;
            dz /= length;
            dx *= this.speed;
            dz *= this.speed;
        }

        this.x += dx * dt;
        this.y += dy * dt;
        this.z += dz * dt;

        // keep player in bounds of the grid
        this.x = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.x));
        this.z = Math.max(-GRID_SIZE / 2 + this.radius, Math.min(GRID_SIZE / 2 - this.radius, this.z));
    }
}