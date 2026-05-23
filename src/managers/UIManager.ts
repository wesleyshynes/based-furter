import type { Game } from "../core/game";

export class UIManager {

    private game: Game;

    constructor(game: Game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // startGame when playBtn is clicked
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.onclick = () => {
                this.game.startGame()
            };
        }
        // resume game when resumeBtn is clicked
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.onclick = () => {
                this.game.resume();
            };
        }
        // quitToMenu when quitBtn is clicked
        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) {
            quitBtn.onclick = () => {
                this.game.returnToMenu();
            };
        }
        // add hover sound effect to all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.onmouseenter = () => {
                this.game.audioManager.play('button_hover');
            };
        });
    }

    hideAllPanels() {
        const uiPanels = document.querySelectorAll('.ui-panel');
        if (uiPanels) {
            // remove active class from all panels
            uiPanels.forEach(panel => panel.classList.remove('active'));
        }
    }

    showPanel(panelId: string) {
        this.hideAllPanels();
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('active');
        }
    }

    showTimer() {
        const timer = document.getElementById('timer');
        if (timer) {
            timer.style.display = 'block';
        }
    }
    hideTimer() {
        const timer = document.getElementById('timer');
        if (timer) {
            timer.style.display = 'none';
        }
    }
    updateTimer(time: number) {
        const timer = document.getElementById('timer');
        if (timer) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

}