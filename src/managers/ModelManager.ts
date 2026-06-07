import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from 'three';
import { enemyData } from "../data/enemyData";
import { playerData } from "../data/playerData";

export class ModelManager {
    private models: { [key: string]: any };
    constructor() {
        this.models = {};
    }

    loadFbx(name: string, url: string, options: any = {
        scale: 1,
    }) {
        // crete a placeholder sphere model while the actual model is loading
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const placeholderModel = new THREE.Mesh(geometry, material);
        placeholderModel.position.set(0, 1, 0);
        placeholderModel.castShadow = true;

        const loader = new FBXLoader();

        this.models[name] = {
            model: placeholderModel,
            animations: [],
            loaded: false,
            error: null,
        }

        return new Promise<void>((resolve) => {
            loader.load(url, (fbx) => {
                const model = fbx;
                model.position.set(0, 1, 0);
                model.scale.set(options.scale, options.scale, options.scale);
                model.castShadow = true;
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).castShadow = true;
                    }
                });

                this.models[name] = {
                    model: model,
                    animations: [], // FBXLoader doesn't support animations in the same way as GLTFLoader
                    loaded: true,
                    error: null,
                }
                resolve();
            }, undefined, (error) => {
                console.error(`Error loading model ${name} from ${url}:`, error);
                this.models[name] = {
                    model: placeholderModel,
                    animations: [],
                    loaded: false,
                    error: error,
                };
                resolve();
            });
        });    
    }


    loadGlb(name: string, url: string, options: any = {
        scale: 1,
    }) {

        // crete a placeholder sphere model while the actual model is loading
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const placeholderModel = new THREE.Mesh(geometry, material);
        placeholderModel.position.set(0, 1, 0);
        placeholderModel.castShadow = true;

        const loader = new GLTFLoader();

        this.models[name] = {
            model: placeholderModel,
            animations: [],
            loaded: false,
            error: null,
        }

        return new Promise<void>((resolve) => {
            loader.load(url, (gltf: GLTF) => {
                const model = gltf.scene;
                // const model = gltf.scene.children[0];
                console.log(`GLTF model ${name} loaded:`, gltf);

                model.position.set(0, 1, 0);
                model.scale.set(options.scale, options.scale, options.scale);
                model.castShadow = true;

                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).castShadow = true;
                    }
                });

                this.models[name] = {
                    model: model,
                    animations: gltf.animations,
                    loaded: true,
                    error: null,
                }
                resolve();

            }, undefined, (error) => {
                console.error(`Error loading model ${name} from ${url}:`, error);
                this.models[name] = {
                    model: placeholderModel,
                    animations: [],
                    loaded: false,
                    error: error,
                };
                resolve();
            });
        })
    }

    loadSphere(name: string, radius: number, color: number) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const model = new THREE.Mesh(geometry, material);
        model.position.set(0, radius, 0);
        model.castShadow = true;

        // add small ball in front of the sphere to know where it's facing at angle 0
        const greenColor = 0x00ff00;
        const frontIndicatorGeometry = new THREE.SphereGeometry(radius * 0.5, 16, 16);
        const frontIndicatorMaterial = new THREE.MeshPhongMaterial({ color: greenColor });
        const frontIndicator = new THREE.Mesh(frontIndicatorGeometry, frontIndicatorMaterial);
        frontIndicator.position.set(0, 0, radius);
        model.add(frontIndicator);

        this.models[name] = {
            model: model,
            animations: [],
            loaded: true,
            error: null,
        }
    }

    get(name: string) {
        return this.models[name] || null;
        // return this.models[name]?.model || null;
    }

    async loadAll() {
        // wait to simulate loading time
        const DEBUG_LOAD_DELAY = 1000;
        await new Promise(resolve => setTimeout(resolve, DEBUG_LOAD_DELAY));

        const modelsToLoad = [
            { name: 'player', url: playerData.model, options: playerData.modelOptions },
        ]
        const spheresToLoad: { name: string; radius: number; color: number }[] = []

        Object.keys(enemyData).forEach(type => {
            if (enemyData[type].model) {
                const options = enemyData[type].modelOptions || { scale: 1 };
                modelsToLoad.push({ name: `enemy_${type}`, url: enemyData[type].model, options });
            } else {
                spheresToLoad.push({ name: `enemy_${type}`, radius: enemyData[type].radius, color: enemyData[type].color });
            }
        });

        await Promise.all(modelsToLoad.map(({ name, url, options }) => {
            if (url.endsWith('.glb')) {
                return this.loadGlb(name, url, options);
            } else if (url.endsWith('.fbx')) {
                return this.loadFbx(name, url, options);
            }
        }));
        spheresToLoad.forEach(({ name, radius, color }) => this.loadSphere(name, radius, color));
    }
}