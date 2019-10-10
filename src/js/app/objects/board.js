import Phaser from 'phaser';
import Logger from 'js-logger';
import FSM from 'phaser3-rex-plugins/plugins/fsm';
import { Tile, RELIVE_COMPLETE, KILL_COMPLETE, MOVE_COMPLETE } from './tile';
import { WaitEvents } from '../utils';

const { GetRandom } = Phaser.Utils.Array;

export class Board extends FSM {
    constructor(scene, numCols = 1, numRows = 1, x = 0, y = 0, cellWidth = 1, cellHeight = 1) {
        super();
        this.uuid = `board-${Phaser.Utils.String.UUID()}`;
        this.log = Logger.get(this.uuid);
        this.scene = scene;
        this.length = numRows * numCols;
        this.numRows = numRows;
        this.numCols = numCols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.width = numCols * cellWidth;
        this.height = numRows * cellHeight;
        this.x = x;
        this.y = y;
        this.pool = new Array(this.length).fill(null);
        this.board = new Array(this.length).fill(null);
        this.particles = this.scene.add.particles('atlas').setDepth(1);
        this.bg = this.scene.add
            .rexRoundRectangle(this.x, this.y, this.width, this.height, 50, 0x000000, 0.2)
            .setOrigin(0)
            .setInteractive();
        this.temp = [];
        this.activeTile = null;
        this.on(
            'statechange',
            () => {
                this.log.info(`change state to ${this.state} `);
            },
            this
        );
        this.log.info('create');
        this.init();
    }

    init() {
        this.log.info('init');
        this.start('INIT');
        this.pool.forEach((el, idx) => {
            this.pool[idx] = new Tile(this);
        });
        this.allMovesComplete = new WaitEvents(this.next, this);
        this.allRelivesComplete = new WaitEvents(this.next, this);
        this.allKillsComplete = new WaitEvents(this.next, this);
        this.goto('RESET_BOARD');
    }

    enter_RESET_BOARD() {
        if (this.prevState !== 'INIT') {
            this.scene.registry.set('matches', this.scene.cache.json.get('atlas_data').matches);
            this.scene.registry.set('score', 0);
        }
        this.board.forEach((el, idx) => {
            this.board[idx] = { index: null, symbol: null };
        });
        this.next();
    }

    // eslint-disable-next-line class-methods-use-this
    next_RESET_BOARD() {
        return 'FILL';
    }

    enter_FILL() {
        this.board.forEach((el, idx) => {
            if (el !== null) {
                el.index = idx;
                el.symbol = GetRandom(this.scene.cache.json.get('atlas_data').tiles);
            }
        });
        this.next();
    }

    // eslint-disable-next-line class-methods-use-this
    next_FILL() {
        return 'FIND_MATCHES';
    }

    enter_FIND_MATCHES() {
        this.temp.length = 0;
        this.resetTilesMatchGroup();
        this.board.forEach(tile => {
            tile !== null && tile.matchGroup === null && this.checkMatches(tile);
        });
        this.next();
    }

    next_FIND_MATCHES() {
        if (this.temp.length > 0) return this.prevState === 'FILL' ? 'RELIVE' : 'IDLE';
        return this.prevState === 'FILL' ? 'FILL' : 'GAME_OVER';
    }

    enter_RELIVE() {
        this.allRelivesCallback = this.allRelivesComplete.waitEvent(this, RELIVE_COMPLETE);
        let row = 0;
        let col = 0;
        let dx = 1;
        let dy = 0;
        let dirChanges = 0;
        let visits = this.numCols;

        for (let i = 0; i < this.length; i++) {
            const tile = this.pool.pop();
            const idx = this.getIndexByColRow(col, row);
            const { index, symbol, matchGroup } = this.board[idx];
            this.board[index] =
                typeof tile === 'undefined'
                    ? new Tile(this).relive(index, symbol, i * 30)
                    : tile.relive(index, symbol, i * 30);
            this.board[index].matchGroup = matchGroup;
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

    // eslint-disable-next-line class-methods-use-this
    next_RELIVE() {
        return 'IDLE';
    }

    enter_IDLE() {
        this.bg.once('pointerdown', this.click, this);
    }

    // eslint-disable-next-line class-methods-use-this
    next_IDLE() {
        return 'CLICK_TILE';
    }

    enter_CLICK_TILE() {
        if (this.activeTile.matchGroup === null) this.activeTile.shake();
        else {
            const numTiles = this.temp[this.activeTile.matchGroup].length;
            const tileScore = numTiles - 1;
            const score = this.scene.registry.get('score');
            this.scene.registry.set('score', score + tileScore * numTiles);
            const matches = this.scene.registry.get('matches');
            this.scene.registry.set('matches', matches - 1);
        }
        this.next();
    }

    next_CLICK_TILE() {
        if (this.activeTile.matchGroup === null) return 'IDLE';
        return 'KILL';
    }

    enter_KILL() {
        this.allKillsCallback = this.allKillsComplete.waitEvent(this, KILL_COMPLETE);
        this.temp[this.activeTile.matchGroup].forEach((index, idx) => {
            this.board[index].kill(idx * 50);
        });
        this.emit(KILL_COMPLETE);
    }

    // eslint-disable-next-line class-methods-use-this
    next_KILL() {
        if (this.scene.registry.get('matches') > 0 && this.board.some(tile => tile !== null))
            return 'TILES_MOVE_UP';
        return 'GAME_OVER';
    }

    enter_TILES_MOVE_UP() {
        this.allMovesCallback = this.allMovesComplete.waitEvent(this, MOVE_COMPLETE);
        this.temp.length = 0;
        for (let col = 0; col < this.numCols; col++) {
            const res = [];
            for (let row = 0; row < this.numRows; row++) {
                const tile = this.board[this.getIndexByColRow(col, row)];
                tile !== null && res.push(tile);
            }
            if (res.length === 0) this.temp.push(col);
            else
                res.length < this.numRows &&
                    res.forEach((tile, idx) => {
                        tile.row = idx;
                    });
        }
        this.emit(MOVE_COMPLETE);
    }

    next_TILES_MOVE_UP() {
        if (this.temp.length > 0) return 'TILES_MOVE_LEFT';
        return 'FIND_MATCHES';
    }

    enter_TILES_MOVE_LEFT() {
        this.allMovesCallback = this.allMovesComplete.waitEvent(this, MOVE_COMPLETE);
        const diplMask = new Array(this.numCols)
            .fill(0)
            .map((el, idx) => this.temp.filter(em => idx > em).length);
        for (let idx = 0; idx < this.length; idx++) {
            const tile = this.board[idx];
            if (tile !== null) tile.col -= diplMask[tile.col];
        }
        this.emit(MOVE_COMPLETE);
    }

    // eslint-disable-next-line class-methods-use-this
    next_TILES_MOVE_LEFT() {
        return 'FIND_MATCHES';
    }

    enter_GAME_OVER() {
        this.log.info('game_over!');
        this.bg.off('pointerdown', this.click, this);
        this.next();
    }

    // eslint-disable-next-line class-methods-use-this
    next_GAME_OVER() {
        return 'KILL_ALL';
    }

    enter_RESET() {
        this.bg.off('pointerdown', this.click, this);
        this.off(RELIVE_COMPLETE);
        this.off(MOVE_COMPLETE);
        this.off(KILL_COMPLETE);
        this.allMovesComplete.remove(this.allMovesCallback, false);
        this.allRelivesComplete.remove(this.allRelivesCallback, false);
        this.allKillsComplete.remove(this.allKillsCallback, false);
        // this.log.info(this.allMovesComplete);
        // this.log.info(this.allRelivesComplete);
        // this.log.info(this.allKillsComplete);
        this.next();
    }

    // eslint-disable-next-line class-methods-use-this
    next_RESET() {
        return 'KILL_ALL';
    }

    enter_KILL_ALL() {
        this.allKillsCallback = this.allKillsComplete.waitEvent(this, KILL_COMPLETE);
        this.board.forEach(tile => {
            tile === null || tile.kill();
        });
        this.emit(KILL_COMPLETE);
    }

    // eslint-disable-next-line class-methods-use-this
    next_KILL_ALL() {
        return 'RESET_BOARD';
    }

    click(pointer, localX, localY, event) {
        this.bg.off('pointerdown', this.click, this);
        this.activeTile = this.board[this.getIndexByXY(localX, localY)];
        this.next();
    }

    getColByIndex(index) {
        return index % this.numCols;
    }

    getRowByIndex(index) {
        return Math.floor(index / this.numCols);
    }

    getIndexByColRow(col, row) {
        return col + this.numCols * row;
    }

    getXbyIndex(index) {
        return this.x + 0.5 * this.cellWidth + this.getColByIndex(index) * this.cellWidth;
    }

    getYbyIndex(index) {
        return this.y + 0.5 * this.cellHeight + this.getRowByIndex(index) * this.cellHeight;
    }

    getColByX(x) {
        return Math.floor(x / this.cellWidth);
    }

    getRowByY(y) {
        return Math.floor(y / this.cellWidth);
    }

    getIndexByXY(x, y) {
        return this.getIndexByColRow(this.getColByX(x), this.getRowByY(y));
    }

    getNeighbors(board, index) {
        const col = this.getColByIndex(index);
        const row = this.getRowByIndex(index);
        const neighbors = [];
        // left
        col > 0 && neighbors.push(board[this.getIndexByColRow(col - 1, row)]);
        // right
        col < this.numCols - 1 && neighbors.push(board[this.getIndexByColRow(col + 1, row)]);
        // top
        row > 0 && neighbors.push(board[this.getIndexByColRow(col, row - 1)]);
        // bottom
        row < this.numRows - 1 && neighbors.push(board[this.getIndexByColRow(col, row + 1)]);
        return neighbors;
    }

    checkMatches(tile) {
        const result = new Set();
        const queue = [tile];
        while (queue.length > 0) {
            const node = queue.pop();
            const neighbors = this.getNeighbors(this.board, node.index);
            neighbors.forEach(neighbor => {
                if (neighbor !== null && neighbor.symbol === node.symbol && !result.has(neighbor)) {
                    queue.push(neighbor);
                    result.add(neighbor);
                }
            });
        }
        if (result.size > 0) {
            result.forEach(neighbor => {
                neighbor.matchGroup = this.temp.length;
            });
            this.temp.push([...result].map(el => el.index));
            result.clear();
        }
    }

    resetTilesMatchGroup() {
        this.board.forEach(tile => {
            if (tile !== null) tile.matchGroup = null;
        });
    }

    destroy() {
        this.log.info('destroy');
        this.allKillsCallback = undefined;
        this.allMovesCallback = undefined;
        this.allRelivesCallback = undefined;
        this.allMovesComplete.destroy();
        this.allKillsComplete.destroy();
        this.allRelivesComplete.destroy();
        this.bg.off('pointerdown', this.click, this);
        this.bg.removeInteractive();
        super.shutdown();
        this.pool.length = 0;
        this.board.length = 0;
        this.temp.length = 0;
        this.allKillsComplete = undefined;
        this.allMovesComplete = undefined;
        this.allRelivesComplete = undefined;
        this.particles = undefined;
        this.scene = undefined;
        this.pool = undefined;
        this.board = undefined;
        this.temp = undefined;
        this.log = undefined;
        this.bg = undefined;
    }
}
