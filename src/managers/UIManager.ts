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

    private playBtnEl: HTMLElement | null;
    private resumeBtnEl: HTMLElement | null;
    private quitBtnEl: HTMLElement | null;
    private playAgainBtnEl: HTMLElement | null;
    private quitFromGameOverBtnEl: HTMLElement | null;

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

        // Buttons
        this.playBtnEl = document.getElementById('playBtn');
        this.resumeBtnEl = document.getElementById('resumeBtn');
        this.quitBtnEl = document.getElementById('quitBtn');
        this.playAgainBtnEl = document.getElementById('playAgainBtn');
        this.quitFromGameOverBtnEl = document.getElementById('quitFromGameOverBtn');

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
        // startGame when playBtn is clicked
        this.playBtnEl?.addEventListener('click', () => {
            this.events.emit(EVENTS.GAME_START);
        });
        // resume game when resumeBtn is clicked
        this.resumeBtnEl?.addEventListener('click', () => {
            this.events.emit(EVENTS.GAME_RESUME);
        });
        // quitToMenu when quitBtn is clicked
        this.quitBtnEl?.addEventListener('click', () => {
            this.events.emit(EVENTS.GAME_RETURN_TO_MENU);
        });
        // play again when playAgainBtn is clicked
        this.playAgainBtnEl?.addEventListener('click', () => {
            this.events.emit(EVENTS.GAME_START);
        });
        // quit to menu when quitFromGameOverBtn is clicked
        this.quitFromGameOverBtnEl?.addEventListener('click', () => {
            this.events.emit(EVENTS.GAME_RETURN_TO_MENU);
        });

        // add hover sound effect to all buttons
        [
            this.playBtnEl,
            this.resumeBtnEl,
            this.quitBtnEl,
            this.playAgainBtnEl,
            this.quitFromGameOverBtnEl,
        ].forEach(button => {
            button?.addEventListener('mouseenter', () => {
                // this.game.playSound('button_hover');
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