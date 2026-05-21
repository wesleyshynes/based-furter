import * as THREE from 'three';
import { GAME_HEIGHT, GAME_WIDTH, GRID_DIVISIONS, GRID_SIZE } from './constants';
import { RenderSystem } from '../systems/renderSystem';
import { Player } from '../entities/player';

export class Game {
    private canvas: HTMLDivElement;

    private player: Player;

    private cube: THREE.Mesh;
    private light: THREE.PointLight;

    private renderSystem: RenderSystem;

    private keys: { [key: string]: boolean };

    private lastTime: number;

    constructor() {
        this.canvas = document.getElementById('threeCanvasContainer') as HTMLDivElement;

        this.renderSystem = new RenderSystem(this.canvas);

        this.player = new Player();
        this.renderSystem.addToScene(this.player.object3d);

        // Create a cube and add it to the scene
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(0, 1, -4);
        this.cube.castShadow = true;
        this.renderSystem.addToScene(this.cube);

        // Add a light source to the scene
        this.light = new THREE.PointLight(0xffffff, 100, 10000);
        this.light.position.set(0, 10, 0);
        this.light.castShadow = true;
        this.renderSystem.addToScene(this.light);

        // add a grid floor to the scene
        const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS);
        gridHelper.position.set(0, 0, 0);
        this.renderSystem.addToScene(gridHelper);

        // Initialize input state        
        this.keys = {};

        this.lastTime = performance.now();

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => { this.resizeCanvas() });
        this.setupInput();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    setupInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
        // Clear all keys when context menu is opened (e.g. right-click)
        window.addEventListener('contextmenu', () => {
            this.keys = {};
        });
        // Clear all keys when window loses focus
        window.addEventListener('blur', () => {
            this.keys = {};
        });
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

    gameLoop(timestamp: number) {

        const dt = (timestamp - this.lastTime) / 1000; // convert to seconds
        this.lastTime = timestamp;

        // console.log('game loop', timestamp);
        requestAnimationFrame((t) => this.gameLoop(t));
        this.update(dt);
        this.renderSystem.render(this.player);
    }

    update(dt: number) {
        // Rotate the cube for some basic animation
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;

        this.player.update(dt, this.keys);
    }

}