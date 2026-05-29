import * as THREE from 'three';
import { GAME_HEIGHT, GAME_STATES, GAME_WIDTH } from '../core/constants';
import type { Player } from '../entities/player';
import type { ModelManager } from '../managers/ModelManager';
import type { Enemy } from '../entities/enemy';

export class RenderSystem {
    private canvas: HTMLDivElement;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private pauseScene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private modelManager: ModelManager;

    private modelIds: { [key: string]: number };

    private trackedModels: { [key: string]: boolean };

    constructor(canvasElement: HTMLDivElement, modelManager: ModelManager) {

        this.canvas = canvasElement;

        this.pauseScene = new THREE.Scene();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, GAME_WIDTH / GAME_HEIGHT, 0.1, 1000);
        // Position the camera so we can see the scene
        this.camera.position.set(0, 20, 20);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
        this.renderer.shadowMap.enabled = true;
        this.canvas.appendChild(this.renderer.domElement);

        this.modelManager = modelManager;

        this.modelIds = {};
        this.trackedModels = {};
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
        if (!this.modelIds['player']) {
            this.modelIds['player'] = playerModel?.id;
            if (playerModel) {
                this.scene.add(playerModel);
            }
        }

        // Update player object position based on player data
        playerModel?.position.set(player.x, player.y, player.z);

        // rotate player model based on angle smoothly
        if (playerModel) {
            playerModel.rotation.y += (player.angle - playerModel.rotation.y) * 0.1;
        }

        // move camera to follow the player
        // this.camera.position.set(player.x, player.y + 5, player.z + 3);
        // this.camera.lookAt(player.x, player.y, player.z);
        this.camera.lookAt(0, 0, 8);
    }

    renderEnemies(enemies: Enemy[]) {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const enemyId = `enemy_${enemy.type}_${enemy.id}`;
            const enemyModel = this.keyedModel(enemyId, `enemy_${enemy.type}`);
            // Update enemy object position based on enemy data
            enemyModel?.position.set(enemy.x, enemy.y, enemy.z);
            this.trackedModels[enemyId] = true;
            // rotate enemy model based on angle smoothly
            if (enemyModel) {
                enemyModel.rotation.y += (enemy.angle - enemyModel.rotation.y) * 0.1;
            }
        }
    }

    keyedModel(key: string, modelId: string) {
        if (!this.modelIds[key]) {
            const model = this.modelManager.get(modelId);
            const modelClone = model?.clone();
            if (modelClone) {
                this.scene.add(modelClone);
                this.modelIds[key] = modelClone.id;
            }
        }
        return this.scene.getObjectById(this.modelIds[key]);
    } 

    render(state: string, player: Player, enemies: Enemy[] = []) {

        if (state !== GAME_STATES.PLAYING) {
            this.renderer.render(this.pauseScene, this.camera);
        } else {
            this.renderPlayer(player);
            this.renderEnemies(enemies);
            Object.keys(this.trackedModels).forEach(key => {
                if (!this.trackedModels[key]) {
                    const modelId = this.modelIds[key];
                    const model = this.scene.getObjectById(modelId);
                    if (model) {
                        this.scene.remove(model);
                    }
                    delete this.modelIds[key];
                    return
                }
                // reset tracking for next frame
                this.trackedModels[key] = false;
            });
            this.renderer.render(this.scene, this.camera);
        }

    }

}