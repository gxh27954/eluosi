

let instance

export default class Network {

  constructor() {
    if (instance)
       return instance

      instance = this

      this.shouldChangeEnemy = false
      this.getScoreRank = false

      this.shouldChangeEnemyData = ''
      this.RankData = ''
  }
}


