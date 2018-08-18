import DataBus from '../databus'
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
import Music from './music'
let atlas = new Image()
atlas.src = 'images/Common.png'

let imageHome = new Image()
imageHome.src = 'images/home.png'

let databus = new DataBus()
export default class GameInfo {


  constructor() {
    this.btnReturnArea = {
      startX:  3 * databus.stepx + databus.gap ,
      startY: screenHeight - databus.stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * databus.stepy - 2 * databus.stepy,
      endX: 5 * databus.stepx + databus.gap,
      endY: screenHeight - databus.stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * databus.stepy - 2 * databus.stepy + 2 * databus.stepy - 3
    }
  }

/**
 * 画分数
 */
  renderGameScore(ctx, score) {
    ctx.fillStyle = "#ffce25"
    ctx.font = Math.round((databus.stepy * 1.5)) + "px Arial"

    ctx.fillText(
      score,
      databus.gap + databus.stepx * 7,
      screenHeight - databus.stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * databus.stepy - 2 * databus.stepy + Math.round((databus.stepy * 1.5))
    )
  }

/**
 * 画游戏结束
 */
  renderGameOver(ctx, score, enemyScore) {
    let music = new Music()
    //music.stopBgm()
    if (databus.gameModel == 'double') {
      console.log('联机的游戏结束')
      databus.ws.close()
    } else {
      console.log('单机游戏结束')
    }

    ctx.drawImage(atlas, 0, 0, 119, 108, screenWidth / 2 - 150, screenHeight / 2 - 100, 300, 300)

    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"

    var character = ''
    if(databus.gameModel == 'double') {
      if (score > enemyScore) {
        character = 'You Win!'
        let music = new Music()
        music.playWin()
      } else if (score < enemyScore) {
        character = 'You Lose!'
        let music = new Music()
        music.playLose()
      } else {
        character = '平局!'
        let music = new Music()
        music.playWin()
      }
    } else {
      character = '游戏结束'
      let music = new Music()
      music.playWin()
    }

    ctx.fillText(
      character,
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 50
    )

    ctx.fillText(
      '得分: ' + score,
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 130
    )

    if (databus.gameModel == 'double') {
      ctx.fillText(
        '对手: ' + enemyScore,
        screenWidth / 2 - 40,
        screenHeight / 2 - 100 + 170
      )
    }

    ctx.drawImage(
      atlas,
      120, 6, 39, 24,
      screenWidth / 2 - 60,
      screenHeight / 2 - 100 + 180 + 10,
      120, 40
    )

    ctx.fillText(
      '重新开始',
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 205 + 10
    )

    /**
     * 重新开始按钮区域
     * 方便简易判断按钮点击
     */

    this.btnArea = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 - 100 + 180,
      endX: screenWidth / 2 + 50,
      endY: screenHeight / 2 - 100 + 255
    }
    
  }


/**
 * 画准备按钮
 */
  cancelGameCanStart(ctx, character1, character2) {


    ctx.fillStyle = "#000000"
    ctx.font = "20px Arial"

    if (character1 == '正在等待对方准备') {
      ctx.fillText(
        character1,
        Math.round((window.innerWidth - 19 * Math.round(0.8 * Math.round(databus.stepx * 6 / 19))) / 2),
        databus.startY[2],
      )
      this.character1 = '正在等待对方准备'
    } else {
      ctx.fillText(
        character1,
        Math.round((window.innerWidth - 19 * Math.round(databus.stepx * 6 / 19)) / 2),
        databus.startY[2],
      )
      this.character1 = '正在等待对手进入房间'
    }


    ctx.drawImage(
      atlas,
      120, 6, 39, 24,
      screenWidth / 2 - 60,
      databus.startY[2] + Math.round(1.5 * databus.stepy) - 25,
      //screenHeight / 2 - 100 + 180 + 10,
      120, 40
    )
    ctx.fillStyle = "#ffffff"
    ctx.fillText(
      character2,
      screenWidth / 2 - 40,
      databus.startY[2] + Math.round(1.5 * databus.stepy)
      //screenHeight / 2 - 100 + 205 + 10
    )


    this.btnCancelGameCanStartArea = {
      startX: screenWidth / 2 - 40,
      startY: databus.startY[2] + Math.round(1.5 * databus.stepy) - 25,
      endX: screenWidth / 2 + 50,
      endY: databus.startY[2] + Math.round(1.5 * databus.stepy) + 50
    }
  }


/**
 * 画 多人游戏 按钮
 */
  changeToDoubleModel(ctx) {

    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"

    ctx.drawImage(
      atlas,
      120, 6, 39, 24,
      databus.gap - 20,
      screenHeight - databus.stepy - 25,
      120, 40
    )

    ctx.fillText(
      '多人游戏',
      databus.gap,
      screenHeight - databus.stepy
    )

    this.btnChangeToDoubleModelArea = {
      startX: databus.gap,
      startY: screenHeight - databus.stepy - 25,
      endX: databus.gap + 90,
      endY: screenHeight - databus.stepy + 50
    }
  }


  returnHome(ctx) {               //返回主页

    ctx.fillStyle = "#000000"
    ctx.font = "20px Arial"

    this.character1 = '正在等待对手进入房间'


    ctx.drawImage(
      imageHome,
      databus.gap +  3 * databus.stepx ,
      databus.startY2 + databus.backgroundLong * databus.stepy2 - 2 * databus.stepy + 3,
      databus.stepx * 2 - 5,
      databus.stepy * 2 - 5
    )
  }

/**
 * 获取排名按钮
 */
  getRank(ctx) {

    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"

    ctx.drawImage(
      atlas,
      120, 6, 39, 24,
      screenWidth - 120,
      screenHeight - databus.stepy - 25,
      120, 40
    )

    ctx.fillText(
      '排行榜',
      screenWidth - 90,
      screenHeight - databus.stepy
    )

    this.btnLookRank = {
      startX: screenWidth - 120,
      startY: screenHeight - databus.stepy - 25,
      endX: screenWidth,
      endY: screenHeight - databus.stepy + 50
    }

    this.btnCloseRank = {
      startX: databus.gap + Math.round(databus.stepx * 8.5),
      startY: screenHeight - databus.stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * databus.stepy - databus.stepy - Math.round(databus.stepy * 0.5),
      endX: databus.gap + Math.round(databus.stepx * 9.5),
      endY: screenHeight - databus.stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * databus.stepy - databus.stepy + Math.round(databus.stepy * 0.5),
    }
  }
}

