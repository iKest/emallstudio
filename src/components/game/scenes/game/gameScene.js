import BaseScene from "../scene";
import TapBoard from "../../objects/tapBoard";
/**
 * Класс игровой сцены
 * @extends {BaseScene}
 */
export default class GameScene extends BaseScene {
/**
 * description
 */
  constructor() {
    super({
      key: "GameScene"
    });
  }

  /**
 * description
 */
  create() {
    super.create();
    this.scene.launch("HUDScene");
    this.board = new TapBoard(this, "tapBoard", {
      position: "center",
      offset: {
        x: 0,
        y: 35
      },
      origin: {
        x: 0.5,
        y: 0.5
      },
      size: {
        numCols: 9,
        numRows: 9
      },
      cell: {
        width: 100,
        height: 100,
        origin: {
          x: 0.5,
          y: 0.5
        }
      },
      tiles: ["coffee_1", "coffee_2", "coffee_3", "coffee_4", "coffee_5"]
    });
  }

  /**
 * description
 */
  awake() {
    this.scene.run("HUDScene");
    this.board.goto("RESET_BOARD");
    super.awake();
  }

  /**
 * description
 */
  sleep() {
    this.scene.sleep("HUDScene");
    super.sleep();
  }

  /**
   * description
   * @param{*} data
  */
  restartScene(data) {
    this.board.goto("RESET");
  }

  /**
 * description
 */
  shutdown() {
    this.board.destroy();
    this.board = undefined;
    super.shutdown();
  }
}
