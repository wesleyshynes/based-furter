import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
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
    private modelState: { [key: string]: any };
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
        this.modelState = {};
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

    setModelTransparency(model: THREE.Object3D, transparent: boolean, opacity: number = 1) {
        model.traverse((child: any) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material instanceof THREE.Material) {
                    mesh.material.transparent = transparent;
                    mesh.material.opacity = opacity;
                    mesh.material.needsUpdate = true; // ensure material updates
                } else if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => {
                        mat.transparent = transparent;
                        mat.opacity = opacity;
                        mat.needsUpdate = true; // ensure material updates
                    });
                }
            }
        });
    }

    renderPlayer(player: Player) {

        const playerModel = this.keyedModel('player', 'player');

        if (player.invincible) {
            // make the player slightly transparent when invincible
            const transparencyValue = 0.3 + 0.7 * Math.abs(Math.sin(player.invincibilityTimer * 10)); // oscillate between 0.3 and 1
            this.setModelTransparency(playerModel!, true, transparencyValue);
            this.modelState['player'].invincible = true;
        } else if (!player.invincible && this.modelState['player'].invincible) {
            // reset to fully opaque when not invincible
            this.setModelTransparency(playerModel!, false, 1);
            this.modelState['player'].invincible = false;
        }

        if (player.redMode && !this.modelState['player'].redMode) {
            this.modelState['player'].redMode = true;
            const originalMaterial: { [meshuuid: string]: THREE.Material | THREE.Material[] } = {};
            playerModel?.traverse((child: any) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    originalMaterial[mesh.uuid] = mesh.material;
                    if (mesh.material instanceof THREE.Material) {
                        mesh.material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                    } else if (Array.isArray(mesh.material)) {
                        mesh.material = mesh.material.map(() => new THREE.MeshPhongMaterial({ color: 0xff0000 }));
                    }
                }
            });
            this.modelState['player'].originalMaterial = originalMaterial;
            // make the player red when in red mode
            
        } else if (!player.redMode && this.modelState['player'].redMode) {
            this.modelState['player'].redMode = false;

            // reset to original material when not in red mode
            playerModel?.traverse((child: any) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const originalMat = this.modelState['player'].originalMaterial[mesh.uuid];
                    if (originalMat) {
                        mesh.material = originalMat;
                    }
                }
            });
            
        }

        // Update player object position based on player data
        playerModel?.position.set(player.x, player.y, player.z);

        // rotate player model based on angle smoothly
        if (playerModel) {
            playerModel.rotation.y += (player.angle - playerModel.rotation.y) * 0.1;
        }

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
            const modelClone = model ? skeletonClone(model) : null;
            if (modelClone) {
                this.addToScene(modelClone);
                this.modelIds[key] = modelClone.id;
                this.modelState[key] = {};
            }
        }
        this.trackedModels[key] = true;
        return this.scene.getObjectById(this.modelIds[key]);
    }

    removeKeyedModel(key: string) {
        const modelId = this.modelIds[key];
        const model = this.scene.getObjectById(modelId);
        if (model) {
            this.removeFromScene(model);
        }
        delete this.modelIds[key];
        delete this.modelState[key];
        delete this.trackedModels[key];
    }

    render(state: string, player: Player, enemies: Enemy[] = []) {

        if (state !== GAME_STATES.PLAYING) {
            this.renderer.render(this.pauseScene, this.camera);
        } else {

            this.renderPlayer(player);
            this.renderEnemies(enemies);

            Object.keys(this.trackedModels).forEach(key => {
                if (!this.trackedModels[key]) {
                    this.removeKeyedModel(key);
                    return
                }
                // reset tracking for next frame
                this.trackedModels[key] = false;
            });

            this.camera.lookAt(0, 0, 8);

            this.renderer.render(this.scene, this.camera);
        }

    }

}