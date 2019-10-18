import swap from "arr-swap";
import Phaser from "phaser";
import {KILL_COMPLETE, MOVE_COMPLETE} from "../events/tileEvents";
import BaseBoard from "./baseBoard";

const getRandom = Phaser.Utils.Array.GetRandom;

/**
 * класс игрового поля c механникой Tap.
 * @extends BaseBoard
 */
export default class TapBoard extends BaseBoard {
  /**
   * Создание игрового поля.
   * @param {Phaser.Scene} scene - сцена в которой создаётся поле.
   * @param {string} key - индификатор игрового поля
   * @param {object} data
  */
  constructor(scene, key, data) {
    super(scene, key, data);
    this.scene = scene;
    this.bg = this.scene.add
      .rexRoundRectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        50,
        0x000000,
        0.2
      )
      .setOrigin(0)
      .setInteractive()
      .setDepth(-1);
    this.emptyCols = [];
    this.goto("RESET_BOARD");
  }

  /** description */
  enter_FILL() {
    this.board.forEach(tile => {
      if(tile !== null) tile.setSymbol(getRandom(this.tiles));
    });
    this.next();
  }

  /** description
   * @return {string}
   */
  next_FILL() {
    return "FIND_MATCHES";
  }

   /** description */
  enter_FIND_MATCHES() {
    this.findMatches();
    this.next();
  }

  /** description
   * @return {string}
   */
  next_FIND_MATCHES() {
    if (this.matchGroups.length > 0) {
      return this.prevState === "FILL" ? "RELIVE" : "IDLE";
    }
    return this.prevState === "FILL" ? "FILL" : "GAME_OVER";
  }

   /** description */
  enter_IDLE() {
    this.bg.once("pointerdown", this.click, this);
  }

  /** description
   * @return {string}
   */
  next_IDLE() {
    return "CLICK_TILE";
  }

   /** description */
  enter_CLICK_TILE() {
    const tile = this.board[this.activeTile];
    if (tile !== null && tile.matchGroup === null) tile.shake();
    this.next();
  }

  /** description
   * @return {string}
   */
  next_CLICK_TILE() {
    const tile = this.board[this.activeTile];
    if (tile === null || tile.matchGroup === null) {
      return "IDLE";
    }
    return "KILL";
  }

   /** description */
  enter_KILL() {
    const tile = this.board[this.activeTile];
    const numTiles = this.matchGroups[tile.matchGroup].length;
    const tileScore = numTiles - 1;
    const score = this.scene.registry.get("score");
    this.scene.registry.set("score", score + tileScore * numTiles);
    const moves = this.scene.registry.get("moves");
    this.scene.registry.set("moves", moves - 1);
    this.allKillsCallback = this.waitEvents.waitEvent(this, KILL_COMPLETE);
    this.matchGroups[tile.matchGroup].forEach((index, i) => {
      this.killTile(this.board[index], i * 50);
    });
    this.emit(KILL_COMPLETE);
  }

  /** description
   * @return {string}
  */
  next_KILL() {
    if (
      this.scene.registry.get("moves") > 0 &&
      this.board.some(tile => tile !== null)
    ) {
      return "TILES_MOVE_UP";
    }
    return "GAME_OVER";
  }

   /** description */
  enter_TILES_MOVE_UP() {
    this.emptyCols.length = 0;
    this.allMovesCallback = this.waitEvents.waitEvent(this, MOVE_COMPLETE);
    for (let col = 0; col < this.numCols; col++) {
      const res = [];
      for (let row = 0; row < this.numRows; row++) {
        const tile = this.board[this.getIndexByColRow(col, row)];
        if (tile !== null) res.push(tile);
      }
      if (res.length === 0) this.emptyCols.push(col);
      else if (res.length < this.numRows) {
        res.forEach((tile, r) => {
          const index = this.getIndexByColRow(col, r);
          if (index !== tile.index) {
            swap(this.board, index, tile.index);
            const dx = this.getXbyIndex(index) - this.getXbyIndex(tile.index);
            const dy = this.getYbyIndex(index) - this.getYbyIndex(tile.index);
            tile.moveCallback = this.waitEvents.waitEvent(tile, MOVE_COMPLETE);
            tile.setIndex(index).move(dx, dy);
          }
        });
      }
    }
    this.emit(MOVE_COMPLETE);
  }

  /** description
   * @return {string}
   */
  next_TILES_MOVE_UP() {
    if (this.emptyCols.length > 0) return "TILES_MOVE_LEFT";
    return "FIND_MATCHES";
  }

   /** description */
  enter_TILES_MOVE_LEFT() {
    this.allMovesCallback = this.waitEvents.waitEvent(this, MOVE_COMPLETE);
    const diplMask = Array.from(
      {length: this.numCols},
      (el, idx) => this.emptyCols.filter(em => idx > em).length
    );
    for (let idx = 0; idx < this.length; idx++) {
      let col = this.getColByIndex(idx);
      if (this.board[idx] !== null && diplMask[col] !== 0) {
        col -= diplMask[col];
        const row = this.getRowByIndex(idx);
        const index = this.getIndexByColRow(col, row);
        const tile = this.board[idx];
        swap(this.board, index, tile.index);
        const dx = this.getXbyIndex(index) - this.getXbyIndex(tile.index);
        const dy = this.getYbyIndex(index) - this.getYbyIndex(tile.index);
        tile.moveCallback = this.waitEvents.waitEvent(tile, MOVE_COMPLETE);
        tile.setIndex(index).move(dx, dy);
      }
    }
    this.emit(MOVE_COMPLETE);
  }

  /** description
   * @return {string}
   */
  next_TILES_MOVE_LEFT() {
    return "FIND_MATCHES";
  }

   /** description */
  enter_GAME_OVER() {
    this.log.info("game_over!");
    this.bg.off("pointerdown", this.click, this);
    this.next();
  }

  /** description
   * @return {string}
   */
  next_GAME_OVER() {
    return "KILL_ALL";
  }

   /** description */
  enter_RESET() {
    this.bg.off("pointerdown", this.click, this);
    this.next();
  }

  /** description
   * @return {string}
   */
  next_RESET() {
    return "KILL_ALL";
  }

  /** description
   * @param {Phaser.Input.Pointer} pointer
   * @param {number} localX
   * @param {number} localY
   * @param {Phaser.Input.Event} event
   */
  click(pointer, localX, localY, event) {
    const index = this.getIndexByXY(localX, localY);
    this.bg.off("pointerdown", this.click, this);
    this.activeTile = index;
    this.next();
  }

  /** decription */
  destroy() {
    this.bg.off("pointerdown", this.click, this);
    this.bg.removeInteractive();
    this.emptyCols.length = 0;
    this.bg = undefined;
  }
}
