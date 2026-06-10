import { EVENTS } from "../core/constants";
import type { EventEmitter } from "../core/eventEmitter";

export class UIManager {

    private events: EventEmitter;

    private hudEl: HTMLElement | null;
    private healthBarFillEl: HTMLElement | null;
    private timerEl: HTMLElement | null;

    private mainMenuEl: HTMLElement | null;
    private pauseMenuEl: HTMLElement | null;
    private loadingScreenEl: HTMLElement | null;
    private gameOverMenuEl: HTMLElement | null;
    private missionCompleteMenuEl: HTMLElement | null;

    private debugInfoEl: HTMLElement | null;

    constructor(events: EventEmitter) {
        this.events = events;

        // HUD
        this.hudEl = document.getElementById('hud');
        this.timerEl = document.getElementById('timer');
        this.healthBarFillEl = document.getElementById('healthBarFill');

        // UI Panels
        this.mainMenuEl = document.getElementById('mainMenu');
        this.pauseMenuEl = document.getElementById('pauseMenu');
        this.loadingScreenEl = document.getElementById('loadingScreen');
        this.gameOverMenuEl = document.getElementById('gameOverMenu');
        this.missionCompleteMenuEl = document.getElementById('missionCompleteMenu');

        // Debug info
        this.debugInfoEl = document.getElementById('debugInfoEl');

        this.setupEventListeners();
    }

    logDebug(message: string) {
        console.log(message);
        if (this.debugInfoEl) {
            this.showDebug();
            this.debugInfoEl.textContent = message;
        }
    }
    showDebug() {
        if (this.debugInfoEl) {
            this.debugInfoEl.style.display = 'block';
        }
    }
    hideDebug() {
        if (this.debugInfoEl) {
            this.debugInfoEl.style.display = 'none';
        }
    }

    setupEventListeners() {

        document.querySelectorAll('[data-action="start"]').forEach(button => {
            button.addEventListener('click', () => {
                this.events.emit(EVENTS.GAME_START);
            });
        });
        
        document.querySelectorAll('[data-action="resume"]').forEach(button => {
            button.addEventListener('click', () => {
                this.events.emit(EVENTS.GAME_RESUME);
            });
        });

        document.querySelectorAll('[data-action="returnToMenu"]').forEach(button => {
            button.addEventListener('click', () => {
                this.events.emit(EVENTS.GAME_RETURN_TO_MENU);
            });
        });

        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.events.emit(EVENTS.SOUND, 'button_hover');
            });
        });
    }

    hideAllPanels() {
        [
            this.mainMenuEl,
            this.pauseMenuEl,
            this.loadingScreenEl,
            this.gameOverMenuEl,
            this.missionCompleteMenuEl
        ].forEach(panel => panel?.classList.remove('active'));
    }

    showPanel(panelId: string) {
        this.hideAllPanels();
        const panel: any = this[`${panelId}El` as keyof UIManager];
        panel?.classList.add('active');
    }

    showHUD() {
        if (this.hudEl) {
            this.hudEl.style.display = 'block';
        }
    }
    hideHUD() {
        if (this.hudEl) {
            this.hudEl.style.display = 'none';
        }
    }
    updateTimer(time: number) {
        if (this.timerEl) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            this.timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    updateHealthBar(health: number, maxHealth: number) {
        if (!this.healthBarFillEl) return;
        const healthPercent = Math.max(0, health / maxHealth);
        this.healthBarFillEl.style.setProperty('--health-percent', healthPercent.toString());
    }

}