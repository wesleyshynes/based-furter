import * as THREE from 'three';
import { PLAYER_START_COORDS } from '../core/constants';

export class Player {

    x: number;
    y: number;
    z: number;

    radius: number;

    object3d: THREE.Object3D;

    constructor() {
        this.x = PLAYER_START_COORDS.x;
        this.y = PLAYER_START_COORDS.y;
        this.z = PLAYER_START_COORDS.z;

        this.radius = 0.5;

        // Create a simple sphere to represent the player
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.object3d = new THREE.Mesh(geometry, material);
        this.object3d.position.set(this.x, this.y, this.z);
        this.object3d.castShadow = true;
    }
}