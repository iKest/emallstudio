const MEMORY_GROW_STEP = 256;
/**
 * Класс пулла объектов.
 */
export default class MemoryPool {
  /**
   * description
   * @param {Function} objectFactory
   * @param {Function} resetObject
   * @param {*} resetContext
   * @param {*} factoryContext
   * @param {number} growBy
   * @param {number} size
   */
  constructor({
    objectFactory,
    resetObject,
    resetContext,
    factoryContext,
    growBy = MEMORY_GROW_STEP,
    size = growBy
  }) {
    this.growBy = growBy;
    this.objectFactory = factoryContext
      ? objectFactory.bind(factoryContext)
      : objectFactory;
    this.resetObject = resetContext
      ? resetObject.bind(resetContext)
      : resetObject;
    this.objectsArray = new Array(size);
    this.freeIndicesArray = new Uint32Array(size);
    this.lastFreeIndex = size - 1;

    for (let index = 0; index < size; index++) {
      const createdObject = objectFactory();
      this.objectsArray[index] = createdObject;
      // eslint-disable-next-line no-underscore-dangle
      createdObject.__memoryAddress__ = index;
      this.freeIndicesArray[index] = index;
    }
  }

  /**
   * description
   * @return {Object}
   */
  allocate() {
    // Expand the array for new element
    if (this.lastFreeIndex === -1) {
      let objectsArraySize = this.objectsArray.length;
      const increasedObjectsArraySize = objectsArraySize + this.growBy;

      this.objectsArray.length = increasedObjectsArraySize;
      this.freeIndicesArray = new Uint32Array(increasedObjectsArraySize);

      let index = 0;
      let createdObject;
      do {
        createdObject = this.objectFactory();
        // eslint-disable-next-line no-underscore-dangle
        createdObject.__memoryAddress__ = objectsArraySize;
        this.objectsArray[objectsArraySize] = createdObject;
        // eslint-disable-next-line no-plusplus
        this.freeIndicesArray[index++] = objectsArraySize++;
      } while (objectsArraySize < increasedObjectsArraySize);

      this.lastFreeIndex = this.growBy - 1;
    }

    // eslint-disable-next-line no-plusplus
    return this.objectsArray[this.freeIndicesArray[this.lastFreeIndex--]];
  }

  /**
   * description
   * @param {Object} object
   */
  free(object) {
    if (this.resetObject) this.resetObject(object);
    this.lastFreeIndex += 1;
    // eslint-disable-next-line no-underscore-dangle
    this.freeIndicesArray[this.lastFreeIndex] = object.__memoryAddress__;
  }

  /**
   * description
  */
  destroy() {
    this.objectsArray.length = 0;
    this.objectsArray = undefined;
    this.freeIndicesArray = undefined;
  }
}
