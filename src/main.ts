import './style.css'
import { Game } from './core/game'


function startGame() {

    const debugInfo = document.getElementById('debugInfo') as HTMLDivElement;

    const initializeContainer = document.getElementById('initializeContainer') as HTMLDivElement;
    const initializeBtn = document.getElementById('initializeBtn') as HTMLButtonElement;

    const audioP: any = document.getElementById('audio-b')

    initializeBtn.addEventListener('click', () => {
        initializeContainer.remove()
        audioP.play()
        // wait 500ms and then remove audioP
        setTimeout(() => {
            audioP.remove()
        }, 500)
        try {
            new Game()
        } catch (error) {
            console.error('Error starting game:', error);
            if (error instanceof Error) {
                debugInfo.textContent = `Error starting game: ${error.message}`;
            }
        }
    })
}

startGame();

// current vid https://www.youtube.com/watch?v=dATpriw6eHA&t=11s. 25 MINUTE MARK