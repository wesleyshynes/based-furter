import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';
import Animated_Robot from '../assets/models/glb/Animated_Robot.glb';
import { enemyData } from "../data/enemyData";

export class ModelManager {
    private models: { [key: string]: any };
    constructor() {
        this.models = {};
    }
    load(name: string, url: string, options: any = {
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
            loaded: false,
            error: null,
        }

        return new Promise<void>((resolve) => {
            loader.load(url, (gltf: GLTF) => {
                const model = gltf.scene;
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
                    loaded: true,
                    error: null,
                }
                resolve();
    
            }, undefined, (error) => {
                console.error(`Error loading model ${name} from ${url}:`, error);
                this.models[name] = {
                    model: placeholderModel,
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
            loaded: true,
            error: null,
        }
    }

    get(name: string) {
        return this.models[name]?.model || null;
    }

    async loadAll() {
        // wait to simulate loading time
        const DEBUG_LOAD_DELAY = 1000;
        await new Promise(resolve => setTimeout(resolve, DEBUG_LOAD_DELAY));

        await Promise.all([
            this.load('player', Animated_Robot, { scale: 0.5 }),
            // this.loadSphere('enemy', 0.5, 0xff0000),
            ...Object.keys(enemyData).map(type => {
                return this.loadSphere(`enemy_${type}`, enemyData[type].radius, enemyData[type].color);
            }),
        ]);
    }
}