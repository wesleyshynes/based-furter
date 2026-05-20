import * as THREE from 'three';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { RenderSystem } from '../systems/renderSystem';

export class Game {
    private canvas: HTMLDivElement;

    private cube: THREE.Mesh;
    private light: THREE.PointLight;

    private renderSystem: RenderSystem;


    constructor() {
        this.canvas = document.getElementById('threeCanvasContainer') as HTMLDivElement;

        this.renderSystem = new RenderSystem(this.canvas);

        // Create a cube and add it to the scene
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(0, 0, -4);
        this.cube.castShadow = true;
        this.renderSystem.addToScene(this.cube);

        // Add a light source to the scene
        this.light = new THREE.PointLight(0xffffff, 1, 100);
        this.light.position.set(0, 0, 0);
        this.light.castShadow = true;
        this.renderSystem.addToScene(this.light);

        // add a grid floor to the scene
        const gridHelper = new THREE.GridHelper(20, 20);
        gridHelper.position.set(0, -1, -4);
        this.renderSystem.addToScene(gridHelper);

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas()
        });
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    resizeCanvas() {
        const ratio = GAME_WIDTH / GAME_HEIGHT;

        let w, h;
        const margin = 15

        const availableWidth = window.innerWidth - margin * 2;
        const availableHeight = window.innerHeight - margin * 2;

        if (availableWidth / availableHeight > ratio) {
            h = availableHeight;
            w = h * ratio;
        } else {
            w = availableWidth;
            h = w / ratio;
        }

        this.renderSystem.resize(w, h);
    }

    update() {
        // Rotate the cube for some basic animation
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }

    gameLoop(timestamp?: number) {
        // console.log('game loop', timestamp);
        requestAnimationFrame((t) => this.gameLoop(t));
        this.update();
        this.renderSystem.render();
    }

}