import Phaser from 'phaser';
import Logger from 'js-logger';
import { TILE_SPEED, RELIVE_KILL_DURATION } from '../config';

export const RELIVE_COMPLETE = 'relive-complete';
export const MOVE_COMPLETE = 'move-complete';
export const KILL_COMPLETE = 'kill-complete';

export class Tile extends Phaser.GameObjects.Sprite {
    constructor(board) {
        super(board.scene);
        board.scene.add.existing(this);
        this.uuid = Phaser.Utils.String.UUID();
        this.matchGroup = null;
        this.log = Logger.get(`tile-${this.uuid}`);
        this.board = board;
        this._matchGroup = null;
        this.setOrigin(0.5);
        this.setScale(0);
        this.setVisible(false);
        this.setActive(false);
        this.shakeTween = this.board.scene.Shake.add(this);
        this.emitter = this.board.particles.createEmitter({
            blendMode: 'ADD',
            scale: { start: 0.15, end: 0 },
            speed: { min: -100, max: 100 },
            quantity: 30,
            on: false,
            emitZone: {
                source: new Phaser.Geom.Circle(0, 0, 50),
                type: 'edge',
                quantity: 30
            }
        });
        // this.log.info('create');
        return this;
    }

    get matchGroup() {
        return this._matchGroup;
    }

    set matchGroup(val) {
        this._matchGroup = val;
    }

    get col() {
        return this.board.getColByIndex(this._index);
    }

    set col(val) {
        const index = this._index;
        const col = this.board.getColByIndex(index);
        const row = this.board.getRowByIndex(index);
        if (col !== val) {
            this._index = this.board.getIndexByColRow(val, row);
            this.board.board[index] = null;
            this.board.board[this._index] = this;
            this.moveCallback = this.board.allMovesComplete.waitEvent(this, MOVE_COMPLETE);
            this.shakeTween.stop();
            this.moveLeft = this.board.scene.tweens.add({
                targets: this,
                x: `-${this.board.getXbyIndex(this._index) - this.x}`,
                duration: TILE_SPEED * Math.abs(col - val),
                ease: 'Bounce.easeOut',
                onComplete: this.moveComplete,
                onCompleteScope: this
            });
            this.log.info(`change col from:${col}  to:${val}`);
        }
    }

    get row() {
        return this.board.getRowByIndex(this._index);
    }

    set row(val) {
        const index = this._index;
        const col = this.board.getColByIndex(index);
        const row = this.board.getRowByIndex(index);
        if (row !== val) {
            this._index = this.board.getIndexByColRow(col, val);
            this.board.board[index] = null;
            this.board.board[this._index] = this;
            this.moveCallback = this.board.allMovesComplete.waitEvent(this, MOVE_COMPLETE);
            this.shakeTween.stop();
            this.moveUp = this.board.scene.tweens.add({
                targets: this,
                y: `-${this.board.getYbyIndex(this._index) - this.y}`,
                duration: TILE_SPEED * Math.abs(row - val),
                ease: 'Bounce.easeOut',
                onComplete: this.moveComplete,
                onCompleteScope: this
            });
            this.log.info(`change row from:${row}  to:${val}`);
        }
    }

    get index() {
        return this._index;
    }

    get symbol() {
        return this._symbol;
    }

    shake() {
        this.shakeTween.isRunning || this.shakeTween.shake();
    }

    setSymbol(symbol) {
        if (this._symbol !== symbol) {
            this._symbol = symbol;
            this.setTexture(symbol);
            this.emitter.setFrame(`${symbol}_particle`);
        }
    }

    kill(delay = 0) {
        // this.log.info('kill');
        if (this.getState !== 'dead') {
            this.setState('dead');
            this.board.pool.push(this);
            this.board.board[this._index] = null;
            this.off(RELIVE_COMPLETE);
            this.off(MOVE_COMPLETE);
            this.board.allMovesComplete.remove(this.moveCallback, false);
            this.board.allRelivesComplete.remove(this.reliveCallback, false);
            this.killCallback = this.board.allKillsComplete.waitEvent(this, KILL_COMPLETE);
            this.killTween = this.board.scene.tweens.add({
                targets: this,
                scaleX: 0,
                scaleY: 0,
                delay,
                duration: RELIVE_KILL_DURATION,
                ease: 'Back.easeIn',
                onComplete: this.killComplete,
                onCompleteScope: this,
                onStart: this.killStart,
                onStartScope: this
            });
        }
        return this;
    }

    relive(index, symbol, delay = 0) {
        this._index = index;
        this.setPosition(this.board.getXbyIndex(index), this.board.getYbyIndex(index));
        this.setState('alive');
        this.setSymbol(symbol);
        this.setActive(true);
        this.setVisible(true);
        this.matchGroup = null;
        this.board.board[index] = this;
        this.reliveCallback = this.board.allRelivesComplete.waitEvent(this, RELIVE_COMPLETE);
        this.reliveTween = this.board.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            delay,
            duration: RELIVE_KILL_DURATION,
            ease: 'Back.easeOut',
            onComplete: this.reliveComplete,
            onCompleteScope: this
        });
        // this.log.info('relive');
        return this;
    }

    killComplete() {
        this.moveUp instanceof Phaser.Tweens.Tween && this.moveUp.stop();
        this.moveLeft instanceof Phaser.Tweens.Tween && this.moveLeft.stop();
        this.setVisible(false);
        this.setActive(false);
        this.emit(KILL_COMPLETE);
    }

    reliveComplete() {
        this.emit(RELIVE_COMPLETE);
    }

    killStart() {
        this.reliveTween instanceof Phaser.Tweens.Tween && this.reliveTween.stop();
        this.shakeTween.stop();
        this.emitter.setPosition(this.x, this.y);
        this.scaleX > 0 && this.scaleY > 0 && this.emitter.explode();
    }

    moveComplete() {
        this.emit(MOVE_COMPLETE);
    }

    preDestroy() {
        this.log.info('destroy');
        this.off(RELIVE_COMPLETE);
        this.off(MOVE_COMPLETE);
        this.off(KILL_COMPLETE);
        this.reliveTween instanceof Phaser.Tweens.Tween && this.reliveTween.remove();
        this.killTween instanceof Phaser.Tweens.Tween && this.killTween.remove();
        this.moveUp instanceof Phaser.Tweens.Tween && this.moveUp.remove();
        this.moveLeft instanceof Phaser.Tweens.Tween && this.moveLeft.remove();
        this.shakeTween.shutDown();
        this.emitter = undefined;
        this.moveCallback = undefined;
        this.reliveCallback = undefined;
        this.killCallback = undefined;
        this.shakeTween = undefined;
        this.reliveTween = undefined;
        this.killTween = undefined;
        this.moveUp = undefined;
        this.moveLeft = undefined;
        this.log = undefined;
        this.uuid = undefined;
        this.matchGroup = undefined;
        this.board = undefined;
        this._symbol = undefined;
        this._index = undefined;
        this._matchGroup = undefined;
        super.preDestroy();
    }
}
