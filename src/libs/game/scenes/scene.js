import capitalize from "capitalize";
import Phaser from "phaser";
import Logger from "js-logger";

/**
 * Базовый класс сцены
 * @extends {Phaser.Scene}
 */
export default class BaseScene extends Phaser.Scene {
  /**
   *
   * @param {Phaser.Scene.Config} config
   */
  constructor(config) {
    super(config);
    this.key = config.key;
    this.log = Logger.get(this.key);
    this.log.info("boot");
  }

  /**
   * description
   */
  init() {
    this.log.info("init");
    this.events.once("shutdown", this.shutdown, this);
    this.events.once("sleep", this.sleep, this);
    this.events.once("pause", this.pause, this);
    this.events.off("destroy", this.destroy, this);
  }

  /**
   * description
   */
  create() {
    this.log.info("create");
    this.images = {};
    this.texts = {};
    this.buttons = {};
    const data = this.cache.json.get("scenes")[this.key];
    if(data)
      data.forEach(element => {
        this[`make${capitalize(element.type)}`](element);
      });
  }
  /**
   * description
   */
  shutdown() {
    this.log.info("shutdown");
    this.events.off("sleep", this.sleep, this);
    this.events.off("pause", this.pause, this);
    this.events.once("destroy", this.destroy, this);
  }

  /**
   * description
   */
  sleep() {
    this.log.info("sleep");
    this.events.off("pause", this.pause, this);
    this.events.once("wake", this.wake, this);
  }

  /**
   * description
   */
  pause() {
    this.log.info("pause");
    this.events.once("resume", this.resume, this);
  }

  /**
   * description
   */
  wake() {
    this.log.info("wake");
    this.events.once("sleep", this.sleep, this);
    this.events.once("pause", this.pause, this);
  }

  /**
   * description
   */
  resume() {
    this.log.info("resume");
    this.events.once("pause", this.pause, this);
  }

  /**
   * description
   */
  destroy() {
    this.log.info("destroy");
    this.events.off("sleep", this.sleep, this);
    this.events.off("pause", this.pause, this);
    this.events.off("shutdown", this.shutdown, this);
    this.log = undefined;
    this.buttons = undefined;
    this.texts = undefined;
    this.images = undefined;
  }

  /**
   * description
   * @param {Object} data
   */
  makeTexts(data) {
    if (!data.data.add) data.data.add = true;
    const text = this.make.text(data.data);
    if (data.text && Array.isArray(data.text)) text.setText(data.text[this.registry.get("language")]);
    else if (data.text) text.setText(data.text);
    if (data.positionFromObject) {
      const object = this[data.positionFromObject.type][
        data.positionFromObject.name
      ];
      let x = object.x;
      let y = object.y;
      if (data.positionFromObject.origin) {
        x +=
          object.width *
          (data.positionFromObject.origin.x
            ? data.positionFromObject.origin.x
            : 0);
        y +=
          object.height *
          (data.positionFromObject.origin.y
            ? data.positionFromObject.origin.y
            : 0);
      }
      if (data.positionFromObject.offset) {
        x += data.positionFromObject.offset.x
          ? data.positionFromObject.offset.x
          : 0;
        y += data.positionFromObject.offset.y
          ? data.positionFromObject.offset.y
          : 0;
      }
      text.setPosition(x, y);
    }
    if (data.name) {
      text.setName(data.name);
      this[data.type][data.name] = text;
    }
  }

  /**
   * description
   * @param {Object} data
   */
  makeImages(data) {
    if (!data.data.add) data.data.add = true;
    const image = this.make.image(data.data);
    if (data.positionFromAtlas) {
      const texture = this.textures.get(data.data.key);
      const {spriteSourceSize} = texture.get(data.data.frame).customData;
      image.setPosition(spriteSourceSize.x, spriteSourceSize.y).setOrigin(0, 0);
    }
    if (data.name) {
      image.setName(data.name);
      this[data.type][data.name] = image;
    }
  }

  /**
   * description
   * @param {Object} data
   */
  makeButtons(data) {
    const button = this.Button.add(
      this[data.object.type][data.object.name],
      data.data
    ).on(
      "click",
      () => {
        this.log.info("click");
        this[data.action](data.actionData);
      },
      this
    );
    if (data.name) {
      button.name = data.name;
      this[data.type][data.name] = button;
    }
  }

/**
 * description
 * @param {*} target
 */
switchScene(target) {
  this.scene.switch(target);
}
}
