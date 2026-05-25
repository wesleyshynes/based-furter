export class ObjectPooler<T> {
    private factoryFn: (id: number) => any;
    pool: any[];
    active: any[];
    constructor(factoryFn: (id: number) => any, poolSize: number) {
        this.factoryFn = factoryFn;
        this.pool = [];
        this.active = [];

        // Pre-populate the pool
        for (let i = 0; i < poolSize; i++) {
            this.pool.push(this.factoryFn(i));
        }
    }
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.factoryFn(this.active.length + this.pool.length);
        }
        this.active.push(obj);
        return obj;
    }
    updateAll(dt: number, ...args: any[]) {
        // update in reverse order to allow safe removal
        for (let i = this.active.length - 1; i >= 0; i--) {
            const obj: { 
                update: (dt: number, ...args: any[]) => void,
                active: boolean
            } = this.active[i];
            obj.update(dt, ...args);
            if (!obj.active) {
                this.release(obj);
            }
        }
    }
    release(obj: any) {
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
            obj.reset(); // reset object state before returning to pool
            this.pool.push(obj);
        }
    }
    releaseAll() {
        for (let i = 0; i < this.active.length; i++) {
            const obj = this.active[i];
            obj.reset();
            this.pool.push(obj);
        }
        this.active = [];
    }
}