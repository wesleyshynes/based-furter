import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { GAME_HEIGHT, GAME_STATES, GAME_WIDTH } from '../core/constants';
import type { Player } from '../entities/player';
import type { ModelManager } from '../managers/ModelManager';
import type { Enemy } from '../entities/enemy';
import { AnimationManager } from '../managers/AnimationManager';

const FLASH_MIN_ALPHA = 0.3;
const FLASH_ALPHA_RANGE = 0.7;
const FLASH_SPEED = 10;

const HEALTH_BAR_OFFSET = 1;
export class RenderSystem {
    private canvas: HTMLDivElement;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private pauseScene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private modelManager: ModelManager;

    private modelIds: { [key: string]: number };
    private modelAnimations: { [key: string]: AnimationManager };
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
        this.modelAnimations = {};
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

    setModelTransparency(model: THREE.Object3D, _transparent: boolean, opacity: number = 1) {
        // Keep transparent=true at all times (set during material clone) to avoid
        // shader recompilation on the first hit. Only vary opacity.
        model.traverse((child: any) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material instanceof THREE.Material) {
                    mesh.material.opacity = opacity;
                } else if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => {
                        mat.opacity = opacity;
                    });
                }
            }
        });
    }

    renderPlayer(dt: number, player: Player) {

        const playerModel = this.keyedModel('player', 'player');

        if (player.invincible) {
            // make the player slightly transparent when invincible
            const transparencyValue = FLASH_MIN_ALPHA + FLASH_ALPHA_RANGE * Math.abs(Math.sin(player.invincibilityTimer * FLASH_SPEED)); // oscillate between 0.3 and 1
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

        if (player.moving) {
            this.modelAnimations['player']?.play('Walking');
        } else {
            this.modelAnimations['player']?.play('Idle');
        }
        this.modelAnimations['player']?.update(dt);

        // rotate player model based on angle smoothly
        if (playerModel) {
            playerModel.rotation.y += (player.angle - playerModel.rotation.y) * 0.1;
        }

    }

    renderEnemies(enemies: Enemy[]) {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy.active) continue; // Skip rendering if enemy is not active
            const enemyId = `enemy_${enemy.type}_${enemy.id}`;
            const enemyModel = this.keyedModel(enemyId, `enemy_${enemy.type}`);

            if (enemy.invincible) {
                // make the enemy slightly transparent when invincible
                const transparencyValue = FLASH_MIN_ALPHA + FLASH_ALPHA_RANGE * Math.abs(Math.sin(enemy.invincibilityTimer * FLASH_SPEED)); // oscillate between 0.3 and 1
                this.setModelTransparency(enemyModel!, true, transparencyValue);
                this.modelState[enemyId].invincible = true;
            } else if (!enemy.invincible && this.modelState[enemyId].invincible) {
                // reset to fully opaque when not invincible
                this.setModelTransparency(enemyModel!, false, 1);
                this.modelState[enemyId].invincible = false;
            }

            // Update enemy object position based on enemy data
            enemyModel?.position.set(enemy.x, enemy.y, enemy.z);
            this.trackedModels[enemyId] = true;
            // rotate enemy model based on angle smoothly
            if (enemyModel) {
                enemyModel.rotation.y += (enemy.angle - enemyModel.rotation.y) * 0.1;
            }

            if (enemy.health < enemy.data.health) {
                this.renderEnemyHealthBar(enemy, enemyId);
            }
        }
    }

    renderEnemyHealthBar(enemy: Enemy, enemyKey: string) {
        const healthBar = this.keyedModel(`healthBar_${enemyKey}`, 'healthBar');
        if (healthBar) {
            const fillMesh = healthBar.children[0] as THREE.Mesh;
            const fillScale = enemy.health / enemy.data.health;
            // fill from left to right
            fillMesh.scale.set(fillScale, 1, 1);
            fillMesh.position.set(-0.5 * (1 - fillScale), 0, 0.01); // Adjust position to keep left edge anchored
        }
        healthBar?.position.set(enemy.x, enemy.radius + HEALTH_BAR_OFFSET, enemy.z);
        // healthBar?.lookAt(this.camera.position);
    }

    keyedModel(key: string, modelId: string) {
        if (!this.modelIds[key]) {
            const modelInfo = this.modelManager.get(modelId);
            const model = modelInfo?.model || null;
            // show model animations
            // console.log(`Model ${modelId} loaded:`, model);
            const modelClone = model ? skeletonClone(model) : null;
            if (modelClone) {
                // Clone materials so each instance has independent material state
                modelClone.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        if (Array.isArray(mesh.material)) {
                            mesh.material = mesh.material.map(mat => {
                                const cloned = mat.clone();
                                // Pre-warm the transparent shader variant so the first hit
                                // doesn't trigger a GPU shader recompile (causing stutter).
                                cloned.transparent = true;
                                cloned.opacity = 1;
                                return cloned;
                            });
                        } else if (mesh.material) {
                            const cloned = (mesh.material as THREE.Material).clone();
                            cloned.transparent = true;
                            cloned.opacity = 1;
                            mesh.material = cloned;
                        }
                    }
                });
                this.addToScene(modelClone);
                this.modelIds[key] = modelClone.id;
                this.modelState[key] = {};

                const animationController = new AnimationManager(modelClone);
                const animations = modelInfo?.animations || [];
                animations.forEach((clip: any) => {
                    animationController.addClip(clip.name, clip);
                });
                this.modelAnimations[key] = animationController;
            }
            // show animations in console
            // console.log(`Model ${modelId} ${key} clone:`, modelClone);
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
        delete this.modelAnimations[key];
    }

    renderDebugOverlay(player: Player, enemies: Enemy[]) {
        const playerCollision = this.keyedModel('player_collision', 'player_collision');
        if (playerCollision) {
            playerCollision.position.set(player.x, player.y, player.z);
        }

        enemies.forEach(enemy => {
            const enemyCollision = this.keyedModel(`enemy_${enemy.type}_collision_${enemy.id}`, `enemy_${enemy.type}_collision`);
            if (enemyCollision) {
                enemyCollision.position.set(enemy.x, enemy.y, enemy.z);
            }
        });
    }

    render(dt: number, state: string, player: Player, enemies: Enemy[] = [], debug: boolean = false) {

        if (state !== GAME_STATES.PLAYING) {
            this.renderer.render(this.pauseScene, this.camera);
        } else {

            this.renderPlayer(dt, player);
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

            if (debug) {
                this.renderDebugOverlay(player, enemies);
            }
        }

    }

}