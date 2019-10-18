import Phaser from "phaser";
import Logger from "js-logger";
import {
  TILE_SPEED,
  TILE_RELIVE_DURATION,
  TILE_KILL_DURATION,
  TILE_SHAKE_DURATION
} from "../config";
import {
  RELIVE_COMPLETE,
  KILL_COMPLETE,
  MOVE_COMPLETE
} from "../events/tileEvents";
import {RELIVING, KILLING, MOVING, IDLE, DEAD} from "../states/tileStates";

const {Tween} = Phaser.Tweens;

/**
 * Базовый класс фишки.
 * @extends Tile
 */
export default class Tile extends Phaser.GameObjects.Sprite {
  /**
   * Создание фишки.
   * @param {BaseBoard} board
  */
  constructor(board) {
    super(board.scene);
    board.scene.add.existing(this);
    this.uuid = Phaser.Utils.String.UUID();
    this.log = Logger.get(`tile-${this.uuid}`);
    this.board = board;
    this._matchGroup = null;
    this._symbol = null;
    this.setOrigin(0.5)
      .setScale(0)
      .setVisible(false)
      .setActive(false);
    this.shakeTween = board.scene.Shake.add(this, {
      duration: TILE_SHAKE_DURATION
    });
    this._state = DEAD;
    this._prevState = undefined;
    // this.log.info('create');
  }

  /**
   * description
   * @return {string}
  */
  get tileState() {
    return this._state;
  }

  /**
   * description
   * @param {string} state
  */
  setTileState(state) {
    this._prevState = this._state;
    this._state = state;
  }

  /**
   * description
   * @return {number}
  */
  get matchGroup() {
    return this._matchGroup;
  }

  /**
   * description
   * @param {number} val
   * @return {Tile}
  */
  setMatchGroup(val) {
    this._matchGroup = val;
    return this;
  }

  /**
   * description
   * @return {number}
  */
  get index() {
    return this._index;
  }

  /**
   * description
   * @param {number} index
   * @return {Tile}
  */
  setIndex(index) {
    this._index = index;
    return this;
  }

  /**
   * description
   * @return {string}
  */
  get symbol() {
    return this._symbol;
  }

  /**
   * description
   * @param {string} symbol
   * @return {Tile}
  */
  setSymbol(symbol) {
    this._symbol = symbol;
    return this;
  }

  /**
   * description
   * @return {Tile}
  */
  shake() {
    if (this.shakeTween.isRunning) this.shakeTween.stop();
    this.shakeTween.shake();
    return this;
  }

  /**
   * description
   * @param {number} dx
   * @param {number} dy
  */
  move(dx, dy) {
    this.setTileState(MOVING);
    if (dx !== 0 || dy !== 0) {
      if (this.shakeTween.isRunning) this.shakeTween.stop();
      const config = {
        targets: this,
        duration: TILE_SPEED * Math.sqrt(dx * dx + dy * dy),
        ease: "Bounce.easeOut",
        onComplete: this.moveComplete,
        onCompleteScope: this
      };
      if (dx !== 0) config.x = dx > 0 ? `++${dx}` : `-${dx}`;
      if (dy !== 0) config.y = dy > 0 ? `++${dy}` : `-${dy}`;
      this.moveTween = this.board.scene.tweens.add(config);
    } else this.moveComplete();
  }

  /**
   * description
   */
  moveComplete() {
    this.setTileState(IDLE);
    this.emit(MOVE_COMPLETE);
  }

  /**
   * description
   * @param {number} delay
   * @return {Tile}
   */
  kill(delay = 0) {
    // this.log.info('kill');
    if (this._state === RELIVING) this.off(RELIVE_COMPLETE);
    if (this._state === MOVING) this.off(MOVE_COMPLETE);
    if (this._state !== KILLING) {
      this.setTileState(KILLING);
      this.killTween = this.board.scene.tweens.add({
        targets: this,
        scaleX: 0,
        scaleY: 0,
        delay,
        duration: TILE_KILL_DURATION,
        ease: "Back.easeIn",
        onComplete: this.killComplete,
        onCompleteScope: this,
        onStart: this.killStart,
        onStartScope: this
      });
    }
    return this;
  }

  /**
   * description
   */
  killStart() {
    if (this._prevState === RELIVING) this.reliveTween.stop();
    if (this.shakeTween.isRunning) this.shakeTween.stop();
    if (this.scaleX > 0) {
      this.killTween.setTimeScale(1 / this.scaleX);
      this.board.killEmitter.emitZone.source.radius = this.displayWidth * 0.5;
      this.board.killEmitter
        .setPosition(this.x, this.y)
        .setFrame(`${this._symbol}_particle`)
        .explode();
    } else {
      this.killTween.stop();
      this.killComplete();
    }
  }

  /**
   * description
   */
  killComplete() {
    if(this._prevState === MOVING) this.moveTween.stop();
    this.setVisible(false);
    this.setActive(false);
    this.setTileState(DEAD);
    this.board.pool.free(this);
    this.emit(KILL_COMPLETE);
  }

  /**
   * description
   * @param {number} delay
   * @return {Tile}
   */
  relive(delay = 0) {
    if (this.texture !== this._symbol) {
      this.setTexture(this._symbol);
    }
    this.setTileState(RELIVING);
    this.reliveTween = this.board.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      delay,
      duration: TILE_RELIVE_DURATION,
      ease: "Back.easeOut",
      onStart: this.reliveStart,
      onStartScope: this,
      onComplete: this.reliveComplete,
      onCompleteScope: this
    });
    // this.log.info('relive');
    return this;
  }

  /**
   * description
   */
  reliveStart() {
    this.setActive(true);
    this.setVisible(true);
  }

  /**
   * description
   */
  reliveComplete() {
    this.setTileState(IDLE);
    this.emit(RELIVE_COMPLETE);
  }

  /**
   * description
   */
  preDestroy() {
    this.log.info("destroy");
    if (this.reliveTween instanceof Tween) this.reliveTween.remove();
    if (this.killTween instanceof Tween) this.killTween.remove();
    if (this.moveTween instanceof Tween) this.moveTween.remove();
    this.shakeTween.shutDown();
    this.killEmitter = undefined;
    this.moveCallback = undefined;
    this.reliveCallback = undefined;
    this.killCallback = undefined;
    this.shakeTween = undefined;
    this.reliveTween = undefined;
    this.killTween = undefined;
    this.moveTween = undefined;
    this.log = undefined;
    this.uuid = undefined;
    this.board = undefined;
    this._symbol = undefined;
    this._index = undefined;
    this._matchGroup = undefined;
    this._state = undefined;
    this._prevState = undefined;
    this.shutDown();
    super.preDestroy();
  }
}
