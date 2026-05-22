import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from 'three';
import Animated_Robot from '../assets/glb/Animated_Robot.glb';

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

        loader.load(url, (gltf) => {
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
            
        }, undefined, (error) => {
            console.error(`Error loading model ${name} from ${url}:`, error);
            this.models[name] = {
                model: placeholderModel,
                loaded: false,
                error: error,
            };
        });
    }

    get(name: string) {
        return this.models[name]?.model || null;
    }

    loadAll() {
        this.load('player', Animated_Robot, { scale: 0.5 });
    }
}