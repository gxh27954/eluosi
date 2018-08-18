let instance


export default class Model {
  constructor() {
    if (instance)
      return instance

    instance = this
    this.gameModel = 'single'
    //this.gameModel = 'double'
  }
}