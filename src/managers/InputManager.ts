import nipplejs from 'nipplejs';
export class InputManager {

    private keys: { [key: string]: boolean };

    private onKeyDown: (event: KeyboardEvent) => void;
    // private onKeyUp: (event: KeyboardEvent) => void;
    // private onBlur: () => void;
    // private onVisibilityChange: () => void;

    private joystickVector: { x: number, y: number };
    private joystickManager: ReturnType<typeof nipplejs.create>

    private actionButtonElement: HTMLElement;

    constructor(joyStickElement: HTMLElement, actionButtonElement: HTMLElement, onKeyDown: (event: KeyboardEvent) => void) {
        this.keys = {};
        this.onKeyDown = onKeyDown;

        this.joystickVector = { x: 0, y: 0 };
        this.joystickManager = nipplejs.create({
            zone: joyStickElement,
            mode: 'static',
            catchDistance: 100,
            position: { left: '50%', top: '50%' },
            color: 'rgba(255, 255, 255, 0.5)',
        })

        this.actionButtonElement = actionButtonElement;
        this.initialize();
    }

    initialize() {
        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
            this.onKeyDown(event);
        });
        window.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
        // Clear all keys when context menu is opened (e.g. right-click)
        window.addEventListener('contextmenu', () => {
            this.keys = {};
        });
        // Clear all keys when window loses focus
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }

    setupTouch() {
        this.joystickManager.on('move', (event) => {
            this.joystickVector = event.data.vector
        })
        this.joystickManager.on('end', () => {
            this.joystickVector = { x: 0, y: 0 }
        })

        // Jump button bindings — inject into keyboard so unified state picks it up
        let mouseDown = false

        this.actionButtonElement.addEventListener('mousedown', () => {
            this.keys[' '] = true;
        })
        this.actionButtonElement.addEventListener('mouseup', () => {
            this.keys[' '] = false;
        })
        this.actionButtonElement.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.keys[' '] = true;
        })
        this.actionButtonElement.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.keys[' '] = false;
        })

        // Track global mouse state for drag-over jump button
        window.addEventListener('mousedown', () => { mouseDown = true })
        window.addEventListener('mouseup', () => { mouseDown = false })
        window.addEventListener('touchstart', () => { mouseDown = true })
        window.addEventListener('touchend', () => { mouseDown = false })
        this.actionButtonElement.addEventListener('mouseover', () => {
            if (mouseDown) this.keys[' '] = true;
        })
        this.actionButtonElement.addEventListener('mouseout', () => {
            this.keys[' '] = false;
        })
    }

    getInputState(): { direction: { x: number, z: number }, keys: { [key: string]: boolean } } {
        return {
            direction: { x: this.joystickVector.x, z: this.joystickVector.y },
            keys: this.keys,
        };
    }
}