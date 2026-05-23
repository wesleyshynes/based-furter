import type { Game } from "../core/game";

export class UIManager {

    private game: Game;
    private timerEl: HTMLElement | null;
    private mainMenuEl: HTMLElement | null;
    private pauseMenuEl: HTMLElement | null;
    private loadingScreenEl: HTMLElement | null;
    private playBtnEl: HTMLElement | null;
    private resumeBtnEl: HTMLElement | null;
    private quitBtnEl: HTMLElement | null;

    constructor(game: Game) {
        this.game = game;
        this.timerEl = document.getElementById('timer');
        this.mainMenuEl = document.getElementById('mainMenu');
        this.pauseMenuEl = document.getElementById('pauseMenu');
        this.loadingScreenEl = document.getElementById('loadingScreen');
        this.playBtnEl = document.getElementById('playBtn');
        this.resumeBtnEl = document.getElementById('resumeBtn');
        this.quitBtnEl = document.getElementById('quitBtn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // startGame when playBtn is clicked
        this.playBtnEl?.addEventListener('click', () => {
            this.game.startGame();
        });
        // resume game when resumeBtn is clicked
        this.resumeBtnEl?.addEventListener('click', () => {
            this.game.resume();
        });
        // quitToMenu when quitBtn is clicked
        this.quitBtnEl?.addEventListener('click', () => {
            this.game.returnToMenu();
        });

        // add hover sound effect to all buttons
        [this.playBtnEl, this.resumeBtnEl, this.quitBtnEl].forEach(button => {
            button?.addEventListener('mouseenter', () => {
                this.game.playSound('button_hover');
            });
        });
    }

    hideAllPanels() {
        [
            this.mainMenuEl,
            this.pauseMenuEl,
            this.loadingScreenEl,
        ].forEach(panel => panel?.classList.remove('active'));
    }

    showPanel(panelId: string) {
        this.hideAllPanels();
        const panel: any = this[`${panelId}El` as keyof UIManager];
        panel?.classList.add('active');
    }

    showTimer() {
        if (this.timerEl) {
            this.timerEl.style.display = 'block';
        }
    }
    hideTimer() {
        if (this.timerEl) {
            this.timerEl.style.display = 'none';
        }
    }
    updateTimer(time: number) {
        if (this.timerEl) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            this.timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

}