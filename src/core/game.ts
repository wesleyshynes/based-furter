import * as THREE from 'three';
import { GAME_HEIGHT, GAME_WIDTH, GRID_DIVISIONS, GRID_SIZE } from './constants';
import { RenderSystem } from '../systems/renderSystem';
import { Player } from '../entities/player';
import { ModelManager } from '../managers/ModelManager';
import { AudioManager } from '../managers/AudioManager';
import { UIManager } from '../managers/UIManager';

export class Game {
    private canvas: HTMLDivElement;

    private modelManager: ModelManager;
    public audioManager: AudioManager;
    private uiManager: UIManager;

    private player: Player;

    private cube: THREE.Mesh;
    private light: THREE.PointLight;

    private renderSystem: RenderSystem;

    private keys: { [key: string]: boolean };

    private lastTime: number;
    private time: number;

    private state: 'menu' | 'playing' | 'paused' = 'menu';

    constructor() {
        this.canvas = document.getElementById('threeCanvasContainer') as HTMLDivElement;

        this.modelManager = new ModelManager();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager(this);

        this.renderSystem = new RenderSystem(this.canvas, this.modelManager);

        this.player = new Player();

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

        this.lastTime = 0;
        this.time = 0

        this.init();
    }

    async init() {

        await Promise.all([
            this.modelManager.loadAll(),
            this.audioManager.loadAll(),
        ]);

        this.uiManager.showPanel('mainMenu');

        this.resizeCanvas();
        window.addEventListener('resize', () => { this.resizeCanvas() });
        this.setupInput();
        this.uiManager.setupEventListeners();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    setupInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;

            if (event.key === 'Escape') {
                console.log('Escape pressed, toggling pause');
                if (this.state === 'playing') {
                    this.pause();
                } else if (this.state === 'paused') {
                    this.resume();
                }
            }
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

    startGame() {
        console.log('start game');
        this.audioManager.play('button_click');
        this.state = 'playing';
        this.uiManager.hideAllPanels();
        this.time = 0;
        this.uiManager.showTimer();

        // reset player position and state
        this.player.reset();

        this.lastTime = performance.now();
    }

    pause() {
        this.audioManager.play('pause');
        this.state = 'paused';
        this.uiManager.showPanel('pauseMenu');
    }

    resume() {
        this.audioManager.play('unpause');
        this.state = 'playing';
        this.uiManager.hideAllPanels();
    }

    returnToMenu() {
        this.audioManager.play('button_click');
        this.state = 'menu';
        this.uiManager.hideTimer();
        this.uiManager.showPanel('mainMenu');
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

        if (this.state === 'playing') {
            this.time += dt;
            this.uiManager.updateTimer(this.time);
        }

        this.update(dt);
        this.renderSystem.render(this.state, this.player);

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt: number) {
        if (this.state !== 'playing') {
            return;
        }

        // Rotate the cube for some basic animation
        this.cube.rotation.x += 1 * dt;
        this.cube.rotation.y += 1 * dt;

        this.player.update(dt, this.keys);
    }

}