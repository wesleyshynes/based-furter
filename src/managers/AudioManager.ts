import { EVENTS } from '../core/constants';
import type { EventEmitter } from '../core/eventEmitter';
import { audioData } from '../data/audioData';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

export class AudioManager {
    private sounds: { [key: string]: any };
    audioContext: AudioContext;
    buffer: AudioBuffer;
    channelData: Float32Array;
    primaryGainControl: GainNode;
    enabled: boolean;

    constructor(events: EventEmitter) {
        this.sounds = {};
        this._registerEvents(events);

        const audioC = window.AudioContext || window.webkitAudioContext
        // this.audioContext = new AudioContext()
        this.audioContext = new audioC()
        this.buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 1,
            this.audioContext.sampleRate
        )
        this.channelData = this.buffer.getChannelData(0)

        this.primaryGainControl = this.audioContext.createGain()
        this.primaryGainControl.gain.setValueAtTime(0.5, 0)
        this.primaryGainControl.connect(this.audioContext.destination)
        this.enabled = true
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
        this.sounds[name] = {
            audio: null,
            loaded: false,
            error: null,
        }

        return new Promise<void>((resolve) => {
            this.loadSound(path).then((decodedBuffer) => {
                this.sounds[name].audio = decodedBuffer;
                this.sounds[name].loaded = true;
                resolve();
            }).catch((error) => {
                console.error(`Error loading sound ${name} from ${path}:`, error);
                this.sounds[name].error = error;
                resolve();
            });
        });
    }

    async loadSound(soundUrl: string = 'https://raw.githubusercontent.com/TinaSoltanian/Patatap/master/sounds/bubbles.mp3') {
        try {
            const rawSound = await fetch(soundUrl)
            const soundBuffer = await rawSound.arrayBuffer()
            const decodedBuffer = await this.audioContext.decodeAudioData(soundBuffer)
            return decodedBuffer
        } catch (error) {
            console.error(`Error loading sound from ${soundUrl}:`, error);
            throw error;
        }
    }

    play(name: string) {
        if (!name) {
            return;
        }
        const sound = this.sounds[name]?.loaded ? this.sounds[name] : null;
        if (sound) {
            this.playSound(sound.audio)
        }
    }

    playSound(decodedBuffer: any, endedCallback?: () => void) {
        if (!this.enabled) {
            return
        }
        const newBuffer = this.audioContext.createBufferSource()
        newBuffer.buffer = decodedBuffer

        const soundGain = this.audioContext.createGain()
        soundGain.gain.setValueAtTime(1, this.audioContext.currentTime)

        newBuffer.connect(soundGain)
        soundGain.connect(this.primaryGainControl)

        if (endedCallback) {
            newBuffer.onended = endedCallback
        }

        // newBuffer.connect(this.primaryGainControl)
        newBuffer.start()
        return newBuffer
    }

    async loadAll() {
        await Promise.all(audioData.map(({ name, path }) => this.load(name, path)));
    }
}