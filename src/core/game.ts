import * as THREE from 'three';
import { GAME_HEIGHT, GAME_WIDTH, GRID_DIVISIONS, GRID_SIZE, PLAYER_START_COORDS } from './constants';
import { RenderSystem } from '../systems/renderSystem';
import { Player } from '../entities/player';
import { ModelManager } from '../managers/ModelManager';

export class Game {
    private canvas: HTMLDivElement;

    private modelManager: ModelManager;

    private player: Player;

    private cube: THREE.Mesh;
    private light: THREE.PointLight;

    private renderSystem: RenderSystem;

    private keys: { [key: string]: boolean };

    private lastTime: number;

    private state: 'menu' | 'playing' | 'paused' = 'menu';

    constructor() {
        this.canvas = document.getElementById('threeCanvasContainer') as HTMLDivElement;

        // Load all models
        this.modelManager = new ModelManager();
        this.modelManager.loadAll();

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

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => { this.resizeCanvas() });
        this.setupInput();
        this.setupUI();

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

    setupUI() {
        // startGame when playBtn is clicked
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.onclick = () => this.startGame();
        }
        // quitToMenu when quitBtn is clicked
        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) {
            quitBtn.onclick = () => this.returnToMenu();
        }
        // resume game when resumeBtn is clicked
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.onclick = () => this.resume();
        }
    }

    hideAllPanels() {
        const uiPanels = document.querySelectorAll('.ui-panel');
        if (uiPanels) {
            // remove active class from all panels
            uiPanels.forEach(panel => panel.classList.remove('active'));
        }
    }

    startGame() {
        console.log('start game');
        this.state = 'playing';
        this.hideAllPanels();

        // reset player position and state
        this.player.reset();

        this.lastTime = performance.now();
    }

    pause() {
        this.state = 'paused';
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.classList.add('active');
        }
    }

    resume() {
        this.state = 'playing';
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.classList.remove('active');
        }
    }

    returnToMenu() {
        this.state = 'menu';
        this.hideAllPanels();
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.add('active');
        }
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
        this.render();
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

    render() {
        if (this.state === 'menu') {
            
        } else {
            this.renderSystem.render(this.player);
        }
    }

}