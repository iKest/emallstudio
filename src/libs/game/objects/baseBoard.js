import Phaser from "phaser";
import Logger from "js-logger";
import FSM from "phaser3-rex-plugins/plugins/fsm";
import WaitEvents from "../utils/waitEvent";
import MemoryPool from "../utils/pool";
import {
  RELIVE_COMPLETE,
  KILL_COMPLETE,
  MOVE_COMPLETE
} from "../events/tileEvents";
import {RELIVING, KILLING, MOVING} from "../states/tileStates";
import Tile from "./tile";

/**
 * Базовый класс игрового поля.
 * @extends FSM
 */
export default class BaseBoard extends FSM {
  /**
     * Создание игрового поля.
     * @param {Phaser.Scene} scene - сцена в которой создаётся поле.
     * @param {string} key - индификатор игрового поля
     * @param {object | string} position - позиция игрового поля.
     * @param {number} position.x
     * @param {number} position.y
     * @param {number} width - The width of the dot, in pixels.
     * @param {object} offset - оффсет игрового поля.
     * @param {number} offset.x
     * @param {number} offset.y
     * @param {object} origin - ориджин игрового поля.
     * @param {number} origin.x
     * @param {number} origin.y
     * @param {object} size - размер игрового поля
     * @param {number} numCols - количество столбцов
     * @param {number} numRows - количество строк
     * @param {object} cell - параметры ячейки игровго поля
     * @param {number} cell.width - ширина ячейки
     * @param {number} cell.height - высота ячейки
     * @param {object} cell.origin - ориджин ячейки
     * @param {number} cell.origin.x
     * @param {number} cell.origin.y
     * @param {string[]} tiles - массив ключей ячеек
     */
  constructor(
    scene,
    key,
    {
      position = {
        x: 0,
        y: 0
      },
      offset = {
        x: 0,
        y: 0
      },
      origin = {
        x: 0,
        y: 0
      },
      size = {
        numCols: 1,
        numRows: 1
      },
      cell = {
        width: 1,
        height: 1,
        origin: {
          x: 0,
          y: 0
        }
      },
      tiles = []
    }
  ) {
    if (!Array.isArray(tiles) || tiles.length === 0) {
      throw new Error("board data need tiles array");
    }
    super();
    this.tiles = tiles;
    this.key = key;
    this.log = Logger.get(key);
    this.scene = scene;
    this.length = size.numRows * size.numCols;
    this.numRows = size.numRows;
    this.numCols = size.numCols;
    this.cellWidth = cell.width;
    this.cellHeight = cell.height;
    this.width = size.numCols * cell.width;
    this.height = size.numRows * cell.height;
    if (position === "center") {
      this.x = scene.cameras.main.width * 0.5;
      this.y = scene.cameras.main.height * 0.5;
    } else {
      this.x = position.x;
      this.y = position.y;
    }
    this.x += offset.x - this.width * origin.x;
    this.y += offset.y - this.height * origin.y;
    this.board = new Array(this.length);
    this.matchGroups = [];
    this.activeTile = null;
    this.killEmitter = this.scene.add
      .particles("atlas")
      .setDepth(1)
      .createEmitter({
        blendMode: "SCREEN",
        scale: {start: 0.15, end: 0},
        speed: {min: -100, max: 100},
        quantity: 20,
        on: false,
        emitZone: {
          source: new Phaser.Geom.Circle(0, 0, cell.width * 0.5),
          type: "edge",
          quantity: 20
        }
      });
    this.pool = new MemoryPool({
      size: this.length,
      objectFactory: () => new Tile(this),
      context: this
    });
    this.on(
      "statechange",
      () => {
        this.log.info(`change state from ${this.prevState} to ${this.state} `);
      },
      this
    );
    this.waitEvents = new WaitEvents(this.next, this);
    this.start("CREATE");
    this.log.info("create");
  }

  /**
   * description
  */
  enter_RESET_BOARD() {
    if (this.prevState !== "CREATE") {
      this.scene.registry.set("moves", this.scene.cache.json.get("game").moves);
      this.scene.registry.set("score", 0);
    }
    for (let idx = 0; idx < this.length; idx++) {
      this.board[idx] = this.pool
        .allocate()
        .setIndex(idx)
        .setPosition(this.getXbyIndex(idx), this.getYbyIndex(idx));
    }
    this.next();
  }

  /**
   * description
   * @return {string}
  */
  next_RESET_BOARD() {
    return "FILL";
  }

  /**
   * description
  */
  enter_RELIVE() {
    this.allRelivesCallback = this.waitEvents.waitEvent(this, RELIVE_COMPLETE);
    let row = 0;
    let col = 0;
    let dx = 1;
    let dy = 0;
    let dirChanges = 0;
    let visits = this.numCols;
    let z = 0;

    for (let i = 0; i < this.length; i++) {
      const idx = this.getIndexByColRow(col, row);
      // eslint-disable-next-line no-plusplus
      if (this.board[idx] !== null) this.reliveTile(this.board[idx], z++ * 30);

      visits -= 1;
      // eslint-disable-next-line no-plusplus
      if (visits === 0) {
        visits = Math.ceil(
          this.numCols * (dirChanges % 2) +
            this.numRows * ((dirChanges + 1) % 2) -
            (0.5 * dirChanges - 1) -
            2
        );
        [dx, dy] = [-dy, dx];
        dirChanges += 1;
      }
      col += dx;
      row += dy;
    }
    this.emit(RELIVE_COMPLETE);
  }

  /**
   * description
   * @return {string}
  */
  next_RELIVE() {
    return "IDLE";
  }

  /**
   * description
  */
  enter_KILL_ALL() {
    if (this.prevState !== "KILL") {
      this.allKillsCallback = this.waitEvents.waitEvent(this, KILL_COMPLETE);
    }
    if (this.prevState === "RELIVE") {
      this.off(RELIVE_COMPLETE);
      this.waitEvent.remove(this.allRelivesCallback, false);
    }
    if (
      this.prevState === "TILES_MOVE_UP" ||
      this.state === "TILES_MOVE_LEFT"
    ) {
      this.off(MOVE_COMPLETE);
      this.waitEvent.remove(this.allMovesCallback, false);
    }
    this.board.forEach(tile => {
      if (tile !== null) this.killTile(tile);
    });
    if (this.prevState !== "KILL") this.emit(KILL_COMPLETE);
  }


  /**
   * description
   * @return {string}
  */
  next_KILL_ALL() {
    if(this.prevState === "GAME_OVER") {
      this.killEmitter.killAll();
      this.scene.gameOver();
    } else return "RESET_BOARD";
  }

  /**
   * description
   * @param {Tile} tile
   * @param {delay} delay
  */
  killTile(tile, delay = 0) {
    if (tile.tileState !== KILLING) {
      this.board[tile.index] = null;
      tile.killCallback = this.waitEvents.waitEvent(tile, KILL_COMPLETE);
      if(tile.tileState === MOVING)
        this.waitEvents.remove(tile.moveCallback, false);
      if (tile.tileState === RELIVING)
        this.waitEvents.remove(tile.reliveCallback, false);
      tile.kill(delay);
    }
  }

  /**
   * description
   * @param {Tile} tile
   * @param {delay} delay
  */
  reliveTile(tile, delay = 0) {
    tile.reliveCallback = this.waitEvents.waitEvent(tile, RELIVE_COMPLETE);
    tile.relive(delay);
  }

  /**
   * description
   * @param {number} index
   * @return {number}
  */
  getColByIndex(index) {
    return index % this.numCols;
  }

  /**
   * description
   * @param {number} index
   * @return {number}
  */
  getRowByIndex(index) {
    return Math.floor(index / this.numCols);
  }

  /**
   * description
   * @param {number} col
   * @param {number} row
   * @return {number}
  */
  getIndexByColRow(col, row) {
    return col + this.numCols * row;
  }

  /**
   * description
   * @param {number} index
   * @return {number}
  */
  getXbyIndex(index) {
    return (
      this.x + 0.5 * this.cellWidth + this.getColByIndex(index) * this.cellWidth
    );
  }

  /**
   * description
   * @param {number} index
   * @return {number}
  */
  getYbyIndex(index) {
    return (
      this.y +
      0.5 * this.cellHeight +
      this.getRowByIndex(index) * this.cellHeight
    );
  }
/**
   * description
   * @param {number} x
   * @return {number}
  */
  getColByX(x) {
    return Math.floor(x / this.cellWidth);
  }

  /**
   * description
   * @param {number} y
   * @return {number}
  */
  getRowByY(y) {
    return Math.floor(y / this.cellWidth);
  }

  /**
   * description
   * @param {number} x
   * @param {number} y
   * @return {number}
  */
  getIndexByXY(x, y) {
    return this.getIndexByColRow(this.getColByX(x), this.getRowByY(y));
  }

  /**
   * description
   * @param {number} index
   * @return {Aray<Tile | null>}
  */
  getNeighbors(index) {
    const col = this.getColByIndex(index);
    const row = this.getRowByIndex(index);
    const neighbors = [];
    // left
    if (col > 0) neighbors.push(this.board[this.getIndexByColRow(col - 1, row)]);
    // right
    if (col < this.numCols - 1)
      neighbors.push(this.board[this.getIndexByColRow(col + 1, row)]);
    // top
    if (row > 0) neighbors.push(this.board[this.getIndexByColRow(col, row - 1)]);
    // bottom
    if (row < this.numRows - 1)
      neighbors.push(this.board[this.getIndexByColRow(col, row + 1)]);
    return neighbors;
  }

  /**
   * description
  */
  resetMatchGroups() {
    this.matchGroups.length = 0;
    this.board.forEach(tile => {
      if(tile !== null) tile.setMatchGroup(null);
    });
  }

  /**
   * description
   * @param {Tile} tile
   * @param {number} numMatches
   * @return {number[] | null}
  */
  findMatche(tile, numMatches = 2) {
    const result = new Set();
    const queue = [tile];
    while (queue.length > 0) {
      const node = queue.pop();
      const neighbors = this.getNeighbors(node.index);
      neighbors.forEach(neighbor => {
        if (
          neighbor !== null &&
          neighbor.symbol === node.symbol &&
          !result.has(neighbor.index)
        ) {
          queue.push(neighbor);
          result.add(neighbor.index);
        }
      });
    }
    return result.size >= numMatches ? [...result] : null;
  }

  /**
   * description
   * @param {number} numMatches
  */
  findMatches(numMatches = 2) {
    this.resetMatchGroups();
    this.board.forEach(tile => {
      if (tile !== null && tile.matchGroup === null) {
        const matches = this.findMatche(tile, numMatches);
        if (matches !== null) {
          matches.forEach(index => {
            this.board[index].setMatchGroup(this.matchGroups.length);
          });
          this.matchGroups.push(matches);
        }
      }
    });
  }

  /**
  * Метод вызываемый при уничтожении объекта
  */
  destroy() {
    this.log.info("destroy");
    this.board.length = 0;
    this.temp.length = 0;
    this.matchGroups.length = 0;
    this.allKillsCallback = undefined;
    this.allMovesCallback = undefined;
    this.allRelivesCallback = undefined;
    this.waitEvents.destroy();
    this.waitEvents = undefined;
    this.scene = undefined;
    this.board = undefined;
    this.pool.destroy();
    this.pool = undefined;
    this.temp = undefined;
    this.log = undefined;
    this.matchGroups = undefined;
    this.killEmitter = undefined;
    this.activeTile = undefined;
    super.shutdown();
  }
}
