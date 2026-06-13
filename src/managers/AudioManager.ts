import { EVENTS } from '../core/constants';
import type { EventEmitter } from '../core/eventEmitter';
import { audioData } from '../data/audioData';

export class AudioManager {
    private sounds: { [key: string]: any };
    constructor(events: EventEmitter) {
        this.sounds = {};
        this._registerEvents(events);
    }

    _registerEvents(events: EventEmitter) {
        events.on(EVENTS.SOUND, (name: string) => {
            this.play(name);
        });
        // play enemy sounds
        events.on(EVENTS.ENEMY_DAMAGED, (enemy: any) => {
            this.play(enemy.data.sounds?.hit);
        });
        events.on(EVENTS.ENEMY_DIED, (enemy: any) => {
            this.play(enemy.data.sounds?.death);
        });
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
        if (!name) {
            return;
        }
        const sound = this.sounds[name]?.loaded ? this.sounds[name] : null;
        if (sound) {
            sound.audio.currentTime = 0; // reset to start
            sound.audio.play().catch((error: any) => {
                console.error(`Error playing sound ${name}:`, error);
            });
        }
    }

    async loadAll() {
        await Promise.all(audioData.map(({ name, path }) => this.load(name, path)));
    }
}