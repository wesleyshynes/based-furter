export class EventEmitter {

    private listeners: { [event: string]: Function[] };

    constructor() {
        this.listeners = {};
    }
    on(event: string, fn: Function) {
        (this.listeners[event] ??= []).push(fn);
    }
    off(event: string, fn: Function) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== fn);
    }
    emit(event: string, ...args: any[]) {
        this.listeners[event]?.forEach(fn => fn(...args));
    }
}