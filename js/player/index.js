import Sprite from '../base/sprite'

import DataBus from '../databus'
import Music from '../runtime/music.js'
import Animation from '../base/animation.js'
import NetWork from '../network'
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// 玩家相关常量设置
const PLAYER_WIDTH = 25
const PLAYER_HEIGHT = 25

let databus = new DataBus()
let music = new Music()

export default class Player extends Sprite {
  
  constructor() {
    super()
    this.flag = 0
    // 初始化事件监听
    this.initEvent()
  }
  
  /**
   * num = 2代表start块
   */
  rreconstructor(ctx, x, y, num) {
    this.reconstructor('', PLAYER_WIDTH, PLAYER_HEIGHT, 100, 100, num)

    this.x = x
    this.y = y
    if (num == 0) {
      this.x = x - (this.rightX - this.leftX) - this.length
    }
    if (num != 2) {
      this.y = y - (this.rightY - this.leftY) - this.length
    }

    this.num = num
    // 用于在手指移动的时候标识手指是否已经在方块上了
    this.touched = false
    this.ctx = ctx

    this.backgroundLong = databus.backgroundLong
    this.backgroundWidth = databus.backgroundWidth
  }

  /**
   * 当手指触摸屏幕的时候
   * 判断手指是否在方块上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @return {Boolean}: 用于标识手指是否在方块上的布尔值
   */
  checkIsFingerOnAir(x, y) {
    const deviation = 20
    return !!(x >= this.x - deviation
      && y >= this.y - deviation
      && x <= this.x + this.width + deviation
      && y <= this.y + this.height + deviation)
  }

  /**
   * 根据手指的位置设置方块的位置
   * 保证手指处于方块中间
   * 同时限定方块的活动范围限制在有效区域中
   */
  setAirPosAcrossFingerPosZ(x, y) {

    let disX = x - this.width / 2
    let disY = y - this.height / 2

    if (disX < 0)
      disX = 0

    else if (disX > screenWidth - this.width)
      disX = screenWidth - this.width

    if (disY <= 0)
      disY = 0

    else if (disY > screenHeight - this.height)
      disY = screenHeight - this.height


    if (this.num == 0 || this.num == 1) {
      this.x = disX - 20
      this.y = disY - 90
      this.judge()
    }

  }

  judge() {         //判断已经拿起的块，放下时会去的目的地，并且将阴影显示出来
    var boxSpecies = databus.boxSpecies[this.num]
    var boxPos = databus.boxPos[this.num]
    var bossX = databus.allBoxs[boxSpecies][boxPos][databus.allBoxs[boxSpecies][boxPos].length - 1][0]
    var bossY = databus.allBoxs[boxSpecies][boxPos][databus.allBoxs[boxSpecies][boxPos].length - 1][1]
    let stepx = databus.stepx;
    let stepy = databus.stepy;
    bossX = this.x - bossX * stepx;
    bossY = this.y - bossY * stepy;

    if (bossX >= databus.gap - 0.65 * stepx && bossX <= databus.backgroundWidth * stepx + databus.gap && bossY >= this.ctx.canvas.height - stepx * databus.buttomGap - (databus.backgroundLong - 1) * stepy - stepy * 0.65 && bossY <= this.ctx.canvas.height - stepx * databus.buttomGap + stepy) {
      let canShow = true
      let posx = 0
      let posy = 0
      if (bossX <= databus.gap) {
        posx = 0
      }
      else for (var i = 0; i < databus.backgroundWidth; i++) {
        if (databus.gap + i * stepx <= bossX && bossX <= databus.gap + (i + 1) * stepx) {
          posx = i
          if (bossX > databus.gap + i * stepx + stepx * 0.65) {
            posx = posx + 1
          }
          break
        }
      }

      if (bossY <= this.ctx.canvas.height - stepx * databus.buttomGap - (databus.backgroundLong - 1) * stepy) {
        posy = 0
      }
      else for (var i = 0; i < databus.backgroundLong; i++) {

        if (this.ctx.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - i) * stepy <= bossY && bossY <= this.ctx.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - i - 1) * stepy) {
          posy = i
          if (bossY > this.ctx.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - i) * stepy + stepy * 0.65) {
            posy = posy + 1
          }
          break
        }
      }

      for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
        var tempx = databus.allBoxs[boxSpecies][boxPos][i][0]
        var tempy = databus.allBoxs[boxSpecies][boxPos][i][1]
        if (posx + tempx < 0 || posx + tempx >= databus.backgroundWidth || posy + tempy < 0 || posy + tempy >= databus.backgroundLong || databus.ground[posx + tempx][posy + tempy] > 1 || databus.ground[posx + tempx][posy + tempy] == -1) {
          canShow = false
        }
      }

      if ((databus.nowx == posx && databus.nowy == posy)) {     //跟上次一样的位置

      } else if (canShow == false || databus.ground[posx][posy] > 1) {   //已经有颜色的位置
        this.empty()
        databus.nowx = -1
        databus.nowy = -1
      } else {
        this.empty()
        databus.nowx = posx
        databus.nowy = posy
        databus.ground[posx][posy] = 1
        for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
          var tempx = databus.allBoxs[boxSpecies][boxPos][i][0]
          var tempy = databus.allBoxs[boxSpecies][boxPos][i][1]
          databus.ground[posx + tempx][posy + tempy] = 1
        }
      }
    } else {         //不在区域内
      databus.nowx = -1
      databus.nowy = -1
      this.empty()
    }
  }

  empty() {
    for (var i = 0; i < databus.backgroundWidth; i++) {
      for (var j = 0; j < databus.backgroundLong; j++) {
        if (databus.ground[i][j] == 1) {
          databus.ground[i][j] = 0
        }
      }
    }
  }
  /**
   * 玩家响应手指的触摸事件
   * 改变方块的位置
   */
  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      //
      if (this.checkIsFingerOnAir(x, y)) {
        this.touched = true
        if (this.num == 2) {   //start变小居中
          databus.startX[2] = Math.round((window.innerWidth - 19 * Math.round(0.8 * Math.round(databus.stepx * 6 / 19))) / 2)
        }
        this.changeBig()
        this.setAirPosAcrossFingerPosZ(x, y)
      }
      
    }).bind(this))

    canvas.addEventListener('touchmove', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      if (this.touched)
        this.setAirPosAcrossFingerPosZ(x, y)

    }).bind(this))

    canvas.addEventListener('touchend', ((e) => {
      e.preventDefault()
      let x = e.changedTouches[0].clientX
      let y = e.changedTouches[0].clientY

      if (this.num == 0 || this.num == 1) {
        this.bottom()
      } else if (databus.gameStart == false) {

        if (this.touched && this.checkIsFingerOnAir(x, y) && databus.rank == false) {
          databus.gameCanStart = true
          this.x = 1000
          this.y = 1000
          databus.player[this.num] = true
          if (databus.gameModel == 'double') {
            databus.sendToEnemy()
          } else if (databus.gameModel == 'single') {
            //console.log('xixi')
            databus.gameStart = true
            music = new Music()
            music.playBgm()
            
          }

        } else {
          this.x = 1000
          this.y = 1000
          databus.player[this.num] = false
        }
      }
      this.touched = false

    }).bind(this))
  }

  bottom() {
    if (this.touched == false) {
      return;
    }
    if (databus.nowx == -1 || databus.nowy == -1) {
      this.visible = false
      this.x = 1000
      this.y = 1000
      databus.nowx == -1
      databus.nowy == -1
      databus.player[this.num] = false
      databus.random[this.num] = false
      return
    }

    for (var i = 0; i < databus.backgroundWidth; i++) {
      for (var j = 0; j < databus.backgroundLong; j++) {
        if (databus.ground[i][j] == 1) {
          var boxSpecies = databus.boxSpecies[this.num]
          var colorNumber = databus.allBoxs[boxSpecies][(databus.allBoxs[boxSpecies].length - 1)][0]
          databus.ground[i][j] = colorNumber
        }
      }
    }

    var canEliminate = 0        //判断是否有可消除的行
    var listLong = []
    var listWidth = []

    for (var j = 0; j < databus.backgroundLong; j++) {
      var sum = 0
      for (var i = 0; i < databus.backgroundWidth; i++) {
        if (databus.ground[i][j] > 1) {
          sum++
        }
      }
      if (sum == databus.backgroundWidth) {
        listLong.push(j)
        canEliminate++
      }
    }

    for (var i = 0; i < databus.backgroundWidth; i++) {
      var sum = 0
      for (var j = 0; j < databus.backgroundLong; j++) {
        if (databus.ground[i][j] > 1) {
          sum++
        }
      }
      if (sum == databus.backgroundLong) {
        listWidth.push(i)
        canEliminate++
      }
    }

    for (var j = 0; j < listLong.length; j++) {
      for (var i = 0; i < databus.backgroundWidth; i++) {
        databus.ground[i][listLong[j]] = 0
      }
    }

    for (var i = 0; i < databus.backgroundWidth; i++) {
      for (var j = 0; j < listWidth.length; j++) {
        databus.ground[listWidth[j]][i] = 0
      }
    }

    /**
     * 一定加分，加  块的个数的  分数
     */
    databus.score += (databus.allBoxs[this.boxSpecies][this.boxPos].length - 1)
    /**
     * 消除1行加10分
     * 消除2行加30分
     * 消除3行加60分
     * 消除4行加100分
     * 消除5行加150分
     */

    if (canEliminate > 0) {
      music.playExplosion()
      databus.haveEliminate += canEliminate
      if (canEliminate == 1) {
        databus.score += 10
        databus.musicIndex = databus.musicIndex + 1
        
      } else if (canEliminate == 2) {
        databus.score += 30
        
        databus.musicIndex = databus.musicIndex + 2
      } else if (canEliminate == 3) {
        databus.score += 60
        
        databus.musicIndex = databus.musicIndex + 3
      } else if (canEliminate == 4) {
        databus.score += 100
        
        databus.musicIndex = databus.musicIndex + 4
      } else if (canEliminate == 5) {
        databus.score += 150
        databus.musicIndex = databus.musicIndex + 5
      }
      if (databus.musicIndex > 5 ) {
        databus.musicIndex = 5
      }
      if (databus.musicIndex == 1) {
        music.playGood()
      } else if(databus.musicIndex == 2) {
        music.playGreat()
      } else if (databus.musicIndex == 3) {
        music.playExcellent()
      } else if (databus.musicIndex == 4) {
        music.playAmazing()
      } else if (databus.musicIndex >= 5) {
        music.playUnbelieve()
      }
    }

    if (databus.gameModel == 'double')
      databus.sendToEnemy()

    this.visible = false
    this.x = 1000
    this.y = 1000
    
    databus.nowx == -1
    databus.nowy == -1
    databus.player[this.num] = false
    databus.random[this.num] = true
  }
  
}
