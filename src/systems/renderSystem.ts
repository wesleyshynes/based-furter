import * as THREE from 'three';
import { GAME_HEIGHT, GAME_WIDTH } from '../core/constants';
import type { Player } from '../entities/player';
import type { ModelManager } from '../managers/ModelManager';

export class RenderSystem {
    private canvas: HTMLDivElement;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private modelManager: ModelManager;

    private modelIds: { [key: string]: number };

    constructor(canvasElement: HTMLDivElement, modelManager: ModelManager) {
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

        this.modelManager = modelManager;

        this.modelIds = {};
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

        const playerModel = this.modelManager.get('player');
        let modelIdChanged = false;
        const playerModelId = playerModel?.id;
        if (playerModelId && this.modelIds['player'] !== playerModelId) {
            modelIdChanged = true;
            // remove old model from scene if it exists
            if (this.modelIds['player']) {
                const oldModel = this.scene.getObjectById(this.modelIds['player']);
                if (oldModel) {
                    this.scene.remove(oldModel);
                }
            }
            this.modelIds['player'] = playerModelId;
            if (playerModel && !this.scene.getObjectById(playerModel.id)) {
                this.scene.add(playerModel);
            }
        }

        // Update player object position based on player data
        playerModel?.position.set(player.x, player.y, player.z);

        // move camera to follow the player
        this.camera.position.set(player.x, player.y + 5, player.z + 3);
        this.camera.lookAt(player.x, player.y, player.z);
    }

    render(player: Player) {
        this.renderPlayer(player);
        this.renderer.render(this.scene, this.camera);
    }

}