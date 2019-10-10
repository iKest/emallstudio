export class WaitEvents {
    constructor(completeCallback, scope) {
        this.setCompleteCallback(completeCallback, scope);
        this.events = new Set();
    }

    shutdown() {
        this.setCompleteCallback(undefined, undefined);
        this.events.clear();
        this.event = undefined;
        return this;
    }

    destroy() {
        this.shutdown();
        return this;
    }

    setCompleteCallback(callback, scope) {
        this.completeCallback = callback;
        this.scope = scope;
        return this;
    }

    waitEvent(eventEmitter, eventName) {
        // const uuid = Phaser.Utils.String.UUID();
        const callback = () => {
            this.remove(callback);
        };
        this.events.add(callback);
        eventEmitter.once(eventName, callback);
        return callback;
    }

    remove(callback, callCompleteCallback = true) {
        this.events.delete(callback);
        if (this.events.size === 0 && callCompleteCallback) {
            if (this.scope) {
                this.completeCallback.call(this.scope);
            } else {
                this.completeCallback();
            }
        }
        return this;
    }
}
