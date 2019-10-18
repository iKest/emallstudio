import {Component, createRef} from "preact";
import {html} from "htm/preact";
import Logger from "js-logger";
import Phaser from "phaser";
import WebFontLoader from "phaser3-rex-plugins/plugins/webfontloader-plugin";
import ButtonPlugin from "phaser3-rex-plugins/plugins/button-plugin";
import RoundRectanglePlugin from "phaser3-rex-plugins/plugins/roundrectangle-plugin";
import BBCodeTextPlugin from "phaser3-rex-plugins/plugins/bbcodetext-plugin";
import ShakePlugin from "phaser3-rex-plugins/plugins/shakeposition-plugin";
import BootScene from "../libs/game/scenes/ui/bootScene";
import BackScene from "../libs/game/scenes/ui/backScene";
import HelloScene from "../libs/game/scenes/ui/helloScene";
import WinScene from "../libs/game/scenes/ui/winScene";
import GameScene from "../libs/game/scenes/game/gameScene";
import HUDScene from "../libs/game/scenes/game/hudScene";
import {gameConfig} from "../libs/game/config";
import styles from "../styles/game.scss";
import Loader from "./loader";


const plugins = {
  global: [
    {
      key: "WebFontLoader",
      plugin: WebFontLoader,
      start: true
    },
    {
      key: "Button",
      plugin: ButtonPlugin,
      mapping: "Button",
      start: true
    },
    {
      key: "RoundRectangle",
      plugin: RoundRectanglePlugin,
      start: true
    },
    {
      key: "BBCodeTextPlugin",
      plugin: BBCodeTextPlugin,
      start: true
    },
    {
      key: "Shake",
      plugin: ShakePlugin,
      mapping: "Shake",
      start: true
    }
  ]
};

/**
 * @param {*} game
 */
export default class Game extends Component {
  log = Logger.get("PhaserComponent");
  ref = createRef();
  state = {
    initialize: true,
  };
  game = {
    ...gameConfig,
    plugins,
    scene: [BootScene, BackScene, HelloScene, GameScene, HUDScene, WinScene]
  };

  initializeGame = () => {
    if(!this.game){
      throw new Error("The configuration of the game is required");
    }
    if(this.game instanceof Phaser.Game){
      throw new Error("A Phaser game already exist");
    }

    this.game.parent = this.ref.current;
    this.game.callbacks = {postBoot : game => {game.events.once("soure-load-complete", _ => this.ref.current.firstChild.remove());}};
    this.log.info(this.ref.current);
    this.game = new Phaser.Game(this.game);
  };

/**
 * Метод, вызывающийся после того, как компонент подключен к DOM.
 * @param  {...any} args
 */
  componentDidMount(...args) {
    this.log.info("componentDidMount", this.ref);
    this.log.info(this.loader);
    if (!this.getGameInstance() && this.state.initialize) {
      this.initializeGame();
    }
  }
/**
 * Метод, вызывающийся до удаления из DOM.
 * @param  {...any} args
 */
  componentWillUnmount(...args) {
    this.log.info("componentWillUnmount",this.ref);
    this.log.info(args);
    this.destroy();
  }
/**
 * Метод, вызывающийся непосредственно перед тем, как будет вызван ComponentUpdate.
 * @param  {...any} args
 */
  getDerivedStateFromProps(...args){
    this.log.info("getDerivedStateFromProps",this.ref);
    this.log.info(args);
  }
/**
 * Метод, вызывающийся перед render(). Чтобы пропустить рендер должен возвращать false
 * @param  {...any} args
 * @return {boolean}
 */
  shouldComponentUpdate(...args){
    this.log.info("shouldComponentUpdate",this.ref);
    this.log.info(args);
    return false;
  }
/**
 * Метод, вызывающийся непосредственно перед render()
 * @param  {...any} args
 */
  getSnapshotBeforeUpdate(...args){
    this.log.info("getSnapshotBeforeUpdate",this.ref);
    this.log.info(args);
  }
/**
 * Метод, вызывающийся после render().
 * @param  {...any} args
 */
  componentDidUpdate(...args){
    this.log.info("componentDidUpdate",this.ref);
    this.log.info(args);
  }
  /**
   * Визуализация компонента Preact
   * @param {Object} props
   * @param {Object} state
   * @return {*}
   */
  render(props, state) {
    this.log.info("render");
    return html`<div id="gameContainer" className=${styles.gameContainer} ref=${this.ref}><${Loader} /></div>`;
  }

  /**
   * Get the Phaser game instance
   */
  async getInstance() {
    return this.getGameInstance();
  }

  /**
   * Destroy the Phaser game instance
   */
  async destroy() {
    if (this.getGameInstance()) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  /**
   *  description
   * @return {Phaser.Game}
   */
  getGameInstance() {
    return this.game instanceof Phaser.Game && this.game;
  }
}
