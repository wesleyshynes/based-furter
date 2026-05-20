import * as THREE from 'three';
import { GAME_HEIGHT, GAME_WIDTH } from '../core/constants';
import type { Player } from '../entities/player';

export class RenderSystem {
    private canvas: HTMLDivElement;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    constructor(canvasElement: HTMLDivElement) {
        console.log('RenderSystem initialized');
        this.canvas = canvasElement;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, GAME_WIDTH / GAME_HEIGHT, 0.1, 1000);
        // Position the camera so we can see the scene
        this.camera.position.set(0, 2, 2);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
        this.renderer.shadowMap.enabled = true;
        this.canvas.appendChild(this.renderer.domElement);
    }

    addToScene(object: THREE.Object3D) {
        this.scene.add(object);
    }

    removeFromScene(object: THREE.Object3D) {
        this.scene.remove(object);
    }

    resize(width: number, height: number) {
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    renderPlayer(player: Player) {
        // Update player object position based on player data
        player.object3d.position.set(player.x, player.y, player.z);
    }

    render(player: Player) {
        this.renderPlayer(player);
        this.renderer.render(this.scene, this.camera);
    }

}