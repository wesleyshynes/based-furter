import * as THREE from 'three';
import { ASPECT_RATIO, GAME_MARGIN, GAME_STATES, GRID_DIVISIONS, GRID_SIZE } from './constants';
import { RenderSystem } from '../systems/renderSystem';
import { Player } from '../entities/player';
import { ModelManager } from '../managers/ModelManager';
import { AudioManager } from '../managers/AudioManager';
import { UIManager } from '../managers/UIManager';
import { EnemyManager } from '../managers/EnemyManager';

export class Game {
    private canvas: HTMLDivElement;

    private modelManager: ModelManager;
    public audioManager: AudioManager;
    private uiManager: UIManager;
    private enemyManager: EnemyManager;

    private player: Player;

    private cube: THREE.Mesh;
    private light: THREE.PointLight;

    private renderSystem: RenderSystem;

    private keys: { [key: string]: boolean };

    private lastTime: number;
    private time: number;

    private state: string;

    constructor() {

        this.state = GAME_STATES.MENU;
        this.canvas = document.getElementById('threeCanvasContainer') as HTMLDivElement;

        this.modelManager = new ModelManager();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager(this);
        this.enemyManager = new EnemyManager();

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
                if (this.state === GAME_STATES.PLAYING) {
                    this.pause();
                } else if (this.state === GAME_STATES.PAUSED) {
                    this.resume();
                }
            }

            // if space and not in menu span an enemy within 4 units of the player
            if (event.key === ' ' && this.state !== GAME_STATES.MENU) {
                const x = this.player.x + (Math.random() - 0.5) * 8;
                const z = this.player.z + (Math.random() - 0.5) * 8;
                this.enemyManager.spawn('drifter', x, z);
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
        this.playSound('button_click');
        this.state = GAME_STATES.PLAYING;
        this.uiManager.hideAllPanels();
        this.time = 0;
        this.uiManager.showTimer();

        // reset player position and state
        this.player.reset();
        // reset enemies
        this.enemyManager.reset();
        // spawn some enemies
        this.enemyManager.spawn('drifter', -2, 3);
        this.enemyManager.spawn('drifter', 4, -5);
        this.enemyManager.spawn('seeker', -3, -4);
        this.enemyManager.spawn('seeker', 5, 2);

        this.lastTime = performance.now();
    }

    pause() {
        this.playSound('pause');
        this.state = GAME_STATES.PAUSED;
        this.uiManager.showPanel('pauseMenu');
    }

    resume() {
        this.playSound('unpause');
        this.state = GAME_STATES.PLAYING;
        this.uiManager.hideAllPanels();
    }

    returnToMenu() {
        this.playSound('button_click');
        this.state = GAME_STATES.MENU;
        this.uiManager.hideTimer();
        this.uiManager.showPanel('mainMenu');
    }

    playSound(name: string) {
        this.audioManager.play(name);
    }

    resizeCanvas() {

        let w, h;

        const availableWidth = window.innerWidth - GAME_MARGIN * 2;
        const availableHeight = window.innerHeight - GAME_MARGIN * 2;

        if (availableWidth / availableHeight > ASPECT_RATIO) {
            h = availableHeight;
            w = h * ASPECT_RATIO;
        } else {
            w = availableWidth;
            h = w / ASPECT_RATIO;
        }

        this.renderSystem.resize(w, h);
    }

    gameLoop(timestamp: number) {

        const dt = (timestamp - this.lastTime) / 1000; // convert to seconds
        this.lastTime = timestamp;

        if (this.state === GAME_STATES.PLAYING) {
            this.time += dt;
            this.uiManager.updateTimer(this.time);
        }

        this.update(dt);
        this.renderSystem.render(this.state, this.player, this.enemyManager.getActiveEnemies());

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt: number) {
        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        // Rotate the cube for some basic animation
        this.cube.rotation.x += 1 * dt;
        this.cube.rotation.y += 1 * dt;

        this.player.update(dt, this.keys);
        this.enemyManager.update(dt, this.player);
    }

}