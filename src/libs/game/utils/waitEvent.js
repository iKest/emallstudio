/**
 * Класс пулла ожидающих событий.
 */
export default class WaitEvents {
  /**
   *
   * @param {Function} completeCallback
   * @param {*} scope
   */
  constructor(completeCallback, scope) {
    this.setCompleteCallback(completeCallback, scope);
    this.events = new Set();
  }
  /**
   * description
   * @return {WaitEvents}
   */
  shutdown() {
    this.setCompleteCallback(undefined, undefined);
    this.events.clear();
    this.event = undefined;
    return this;
  }

  /**
   * description
   * @return {WaitEvents}
   */
  destroy() {
    this.shutdown();
    return this;
  }

  /**
   * description
   * @param {Function} callback
   * @param {*} scope
   * @return {WaitEvents}
   */
  setCompleteCallback(callback, scope) {
    this.completeCallback = callback;
    this.scope = scope;
    return this;
  }

  /**
   * description
   * @param {Phaser.Events.EventEmitter} eventEmitter
   * @param {string} eventName
   * @return {Function}
   */
  waitEvent(eventEmitter, eventName) {
    // const uuid = Phaser.Utils.String.UUID();
    const callback = () => {
      this.remove(callback);
    };
    this.events.add(callback);
    eventEmitter.once(eventName, callback);
    return callback;
  }
  /**
   * description
   * @param {Function} callback
   * @param {boolean} callCompleteCallback
   * @return {WaitEvents}
   */
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
