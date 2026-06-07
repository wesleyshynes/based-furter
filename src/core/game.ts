import * as THREE from 'three';
import { ASPECT_RATIO, EVENTS, GAME_MARGIN, GAME_STATES, GRID_DIVISIONS, GRID_SIZE } from './constants';
import { RenderSystem } from '../systems/renderSystem';
import { Player } from '../entities/player';
import { ModelManager } from '../managers/ModelManager';
import { AudioManager } from '../managers/AudioManager';
import { UIManager } from '../managers/UIManager';
import { EnemyManager } from '../managers/EnemyManager';
import { EnemySpawner } from '../managers/EnemySpawner';
import { EventEmitter } from './eventEmitter';
import { CollisionSystem } from '../systems/collisionSystem';
import { CollisionManager } from '../managers/CollisionManager';
import type { Enemy } from '../entities/enemy';
import { InputManager } from '../managers/InputManager';

export class Game {
    private canvas: HTMLDivElement;

    private events: EventEmitter;
    private modelManager: ModelManager;
    public audioManager: AudioManager;
    private uiManager: UIManager;
    private enemyManager: EnemyManager;
    private enemySpawner: EnemySpawner;
    private collisionSystem: CollisionSystem;
    private collisionManager: CollisionManager;

    private inputManager: InputManager;

    private player: Player;

    private cube: THREE.Mesh;
    private light: THREE.PointLight;

    private renderSystem: RenderSystem;

    // private keys: { [key: string]: boolean };

    private lastTime: number;
    private time: number;

    private state: string;

    constructor() {

        this.state = GAME_STATES.MENU;
        this.canvas = document.getElementById('threeCanvasContainer') as HTMLDivElement;

        this.events = new EventEmitter();

        this.modelManager = new ModelManager();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager(this.events);
        this.enemyManager = new EnemyManager();
        this.enemySpawner = new EnemySpawner(this.enemyManager);

        this.collisionSystem = new CollisionSystem();
        this.collisionManager = new CollisionManager(this.collisionSystem, this.events);

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
        // this.keys = {};
        const joystickElement = document.getElementById('joystick') as HTMLElement;
        const actionButtonElement = document.getElementById('action-btn') as HTMLElement;
        this.inputManager = new InputManager(joystickElement, actionButtonElement, (event) => {
            // Handle key down events
            if (event.key === 'Escape') {
                if (this.state === GAME_STATES.PLAYING) {
                    this.pause();
                } else if (this.state === GAME_STATES.PAUSED) {
                    this.resume();
                }
            }
        });

        this.lastTime = 0;
        this.time = 0

        this.init();
    }

    async init() {

        this.uiManager.hideDebug();

        await Promise.all([
            this.modelManager.loadAll(),
            this.audioManager.loadAll(),
        ]);

        // Sound Events
        this.events.on(EVENTS.SOUND, (name: string) => {
            this.audioManager.play(name);
        });

        // Game State Events
        this.events.on(EVENTS.GAME_START, () => {
            this.startGame();
        });
        this.events.on(EVENTS.GAME_PAUSE, () => {
            this.pause();
        });
        this.events.on(EVENTS.GAME_RESUME, () => {
            this.resume();
        });
        this.events.on(EVENTS.GAME_RETURN_TO_MENU, () => {
            this.returnToMenu();
        });

        // Player Events
        this.events.on(EVENTS.PLAYER_DAMAGED, (health: number, maxHealth: number) => {
            this.events.emit(EVENTS.SOUND, 'player_hurt');
            this.uiManager.updateHealthBar(health, maxHealth);
        });

        this.events.on(EVENTS.PLAYER_DIED, () => {
            this.events.emit(EVENTS.SOUND, 'game_over');
            this.gameOver();
        });

        this.uiManager.showPanel('mainMenu');

        this.resizeCanvas();
        window.addEventListener('resize', () => { this.resizeCanvas() });
        this.inputManager.initialize();
        this.uiManager.setupEventListeners();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    startGame() {
        this.events.emit(EVENTS.SOUND, 'button_click');
        this.state = GAME_STATES.PLAYING;
        this.uiManager.hideAllPanels();
        this.time = 0;
        this.uiManager.showHUD();

        // reset player position and state
        this.player.reset();
        // reset enemies
        this.enemyManager.reset();
        this.enemySpawner.reset();

        this.lastTime = performance.now();
        this.uiManager.updateHealthBar(this.player.health, this.player.maxHealth);
    }

    pause() {
        this.events.emit(EVENTS.SOUND, 'pause');
        this.state = GAME_STATES.PAUSED;
        this.uiManager.showPanel('pauseMenu');
    }

    resume() {
        this.events.emit(EVENTS.SOUND, 'unpause');
        this.state = GAME_STATES.PLAYING;
        this.uiManager.hideAllPanels();
    }

    returnToMenu() {
        this.events.emit(EVENTS.SOUND, 'button_click');
        this.state = GAME_STATES.MENU;
        this.uiManager.hideHUD();
        this.uiManager.showPanel('mainMenu');
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        this.uiManager.hideHUD();
        this.uiManager.showPanel('gameOverMenu');
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

        const activeEnemies = this.enemyManager.getActiveEnemies();
        this.update(dt, activeEnemies);
        this.renderSystem.render(dt, this.state, this.player, activeEnemies);

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt: number, activeEnemies: Enemy[]) {
        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        // Rotate the cube for some basic animation
        this.cube.rotation.x += 1 * dt;
        this.cube.rotation.y += 1 * dt;

        this.player.update(dt, this.inputManager.getInputState());
        this.enemyManager.update(dt, this.player);
        this.enemySpawner.update(dt);
        this.collisionManager.update(this.player, activeEnemies);
    }

}