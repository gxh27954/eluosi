let instance

/**
 * 统一的音效管理器
 */
export default class Music {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.bgmAudio = new Audio()
    this.bgmAudio.loop = true
    this.bgmAudio.src  = 'audio/gamemusic.mp3'

    this.gameStartAudio = new Audio()
    this.gameStartAudio.src = 'audio/readygo.mp3'

    this.gameWin = new Audio()
    this.gameWin.src = 'audio/win.mp3'

    this.gameLose = new Audio()
    this.gameLose.src = 'audio/lose.mp3'

    this.shootAudio     = new Audio()
    this.shootAudio.src = 'audio/bullet.mp3'

    this.boomAudio     = new Audio()
    this.boomAudio.src = 'audio/btnclick.mp3'

    this.good = new Audio()
    this.good.src = 'audio/good.mp3'

    this.great = new Audio()
    this.great.src = 'audio/great.mp3'

    this.excellent = new Audio()
    this.excellent.src = 'audio/excellent.mp3'

    this.amazing = new Audio()
    this.amazing.src = 'audio/amazing.mp3'

    this.unbelieve = new Audio()
    this.unbelieve.src = 'audio/unbelieve.mp3'

    this.hole = new Audio()
    this.hole.src = 'audio/dianji.mp3'
  }

  playBgm() {
   //this.bgmAudio.play()
    this.gameStartAudio.play()
  }

  playWin() {
    this.gameWin.play()
  }

  playLose() {
    this.gameLose.play()
  }

  playShoot() {
    this.shootAudio.currentTime = 0
    this.shootAudio.play()
  }

  playGood() {
    this.good.play()
  }

  playGreat() {
    this.great.play()
  }

  playExcellent() {
    this.excellent.play()
  }

  playAmazing() {
    this.amazing.play()
  }

  playUnbelieve() {
    this.unbelieve.play()
  }

  playHole() {
    this.hole.play()
  }

  playExplosion() {
    this.boomAudio.currentTime = 0
    this.boomAudio.play()
  }
}
