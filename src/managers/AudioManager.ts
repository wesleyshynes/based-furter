import PauseSound from '../assets/audio/pause.mp3';
import UnpauseSound from '../assets/audio/button_click.mp3';
import ButtonHoverSound from '../assets/audio/button_hover.mp3';
import ButtonClickSound from '../assets/audio/button_click.mp3';

export class AudioManager {
    private sounds: { [key: string]: any };
    constructor() {
        this.sounds = {};
    }

    load(name: string, path: string) {
        const audio = new Audio(path);
        this.sounds[name] = {
            audio: audio,
            loaded: false,
            error: null,
        }

        return new Promise<void>((resolve) => {
            audio.onloadeddata = () => {
                this.sounds[name].loaded = true;
                console.log(`Sound ${name} loaded successfully`);
                resolve();
            }
            audio.onerror = (error) => {
                console.error(`Error loading sound ${name} from ${path}:`, error);
                this.sounds[name].error = error;
                resolve();
            }
        });
    }

    play(name: string) {
        const sound = this.sounds[name]?.loaded ? this.sounds[name] : null;
        if (sound) {
            sound.audio.currentTime = 0; // reset to start
            sound.audio.play().catch((error: any) => {
                console.error(`Error playing sound ${name}:`, error);
            });
        }
    }

    async loadAll() {
        await Promise.all([
            this.load('pause', PauseSound),
            this.load('unpause', UnpauseSound),
            this.load('button_hover', ButtonHoverSound),
            this.load('button_click', ButtonClickSound),
        ])
    }
}