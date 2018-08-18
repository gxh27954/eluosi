
import Sprite from '../base/sprite'
import DataBus from '../databus'

import NetWork from '../network'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const BG_IMG_SRC = 'images/bg.jpg'
const BG_WIDTH = 512
const BG_HEIGHT = 512

let network = new NetWork()
var imagePeople1 = new Image()       //我的头像
imagePeople1.src = 'images/06.png'

var imagePeople2 = new Image()   //对方头像
imagePeople2.src = 'images/07.png'

var imageStop = new Image()   //洞洞的图片
imageStop.src = 'images/stop.png'

var image = [0,0,0,0,0]        //排名榜里5个人的头像
image[0] = new Image()
image[1] = new Image()
image[2] = new Image()
image[3] = new Image()
image[4] = new Image()

var image2 = new Image()  //排行榜右上角叉叉
image2.src = 'images/no.png'

var length = 0

let databus = new DataBus()

/**
 * 游戏背景类
 * 
 */
export default class BackGround extends Sprite {
  constructor(ctx) {
    super()
    this.sum = 0
    this.iconsFlag = []
    for (var i = 0; i < 54; i++) {
      this.iconsFlag[i] = 0
    }
    this.iconsShow = []
    this.render(ctx)

    this.top = 0

    this.srcs = [0, 0, 0, 0, 0]
    this.nicknames = [0, 0, 0, 0, 0]
    this.scores = [0, 0, 0, 0, 0]

  }

  update() {
    this.top += 2

    if (this.top >= screenHeight)
      this.top = 0
  }

  /**
   * 背景图重绘函数
   */
  render(ctx) {

    let context = ctx;

    context.fillStyle = 'white'          //画白底
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    /**
     * 
     * 画头像
     * 双人模式先画自己头像
     * 房间里有两个人了再画对手头像
     */

    if (databus.gameModel == 'double') { 

      if (databus.selfImageUrl != '') {
        imagePeople1.src = databus.selfImageUrl
      }
      context.drawImage(imagePeople1, databus.gap, databus.startY2 + databus.backgroundLong * databus.stepy2 - 2 * databus.stepy, 2 * databus.stepy, 2 * databus.stepy)
    }

    if (databus.roomPeople == 2) {
      if (databus.enemyImageUrl != '') {
        imagePeople2.src = databus.enemyImageUrl
        //imagePeople2.src = 'https://wx.qlogo.cn/mmopen/vi_32/W3ZKnsp2oaWAe1pkYEbxDwrOAItslBDanQKauWribTB4ljM2p2Dt5ibc2xf4rMW8BYdp8icEx1j4EZrDSHtbbWTBA/0'
      }
      context.drawImage(imagePeople2, window.innerWidth - (databus.gapRight + databus.backgroundWidth * databus.stepy2 + 4 * databus.stepy2), databus.startY2, 3 * databus.stepy2, 3 * databus.stepy2)
    }


/**
 * 画格子
 */
    let stepx = databus.stepx;
    let stepy = databus.stepy;

    context.fillStyle = '#edeae1'

    for (var i = 0; i < databus.backgroundWidth; i++) {
      for (var j = 0; j < databus.backgroundLong; j++) {
        if (databus.ground[i][j] == 1) {
          context.fillStyle = '#CC6666'
          context.fillRect(databus.gap + i * stepx, context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - j) * stepy, stepx - 1, stepy - 1)
        } else if (databus.ground[i][j] > 1) {
          context.fillStyle = databus.colors[databus.ground[i][j]]
          context.fillRect(databus.gap + i * stepx, context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - j) * stepy, stepx - 1, stepy - 1)
        }
        else if (databus.ground[i][j] == 0) {
          context.fillStyle = '#edeae1'
          context.fillRect(databus.gap + i * stepx, context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - j) * stepy, stepx - 1, stepy - 1)
        } else if (databus.ground[i][j] == -1) {
          context.drawImage(imageStop, databus.gap + i * stepx, context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1) - j) * stepy, stepx - 1, stepy - 1)
        }
      }
    }

/**
 * 双人模式下画对方格子
 */
    if (databus.gameModel == 'double') {
      let stepx2 = databus.stepx2;
      let stepy2 = databus.stepy2;
      for (var i = 0; i < databus.backgroundWidth; i++) {
        for (var j = 0; j < databus.backgroundLong; j++) {

          if (databus.enemyGround[i][j] == 1) {
            context.fillStyle = '#CC6666'
            context.fillRect(databus.startX2 + i * stepx2, databus.startY2 + j * stepy2, stepx2 - 1, stepy2 - 1)
          } else if (databus.enemyGround[i][j] > 1) {
            context.fillStyle = databus.colors[databus.enemyGround[i][j]]
            context.fillRect(databus.startX2 + i * stepx2, databus.startY2 + j * stepy2, stepx2 - 1, stepy2 - 1)
          }
          else if (databus.enemyGround[i][j] == 0) {
            context.fillStyle = '#edeae1'
            context.fillRect(databus.startX2 + i * stepx2, databus.startY2 + j * stepy2, stepx2 - 1, stepy2 - 1)
          } else if (databus.enemyGround[i][j] == -1) {
            context.drawImage(imageStop, databus.startX2 + i * stepx2, databus.startY2 + j * stepy2, stepx2 - 1, stepy2 - 1)
          }
        }
      }


      ctx.fillStyle = "#000000"

      ctx.font = Math.round(databus.stepy * 0.6) + "px Arial"
      //ctx.font = '20px Arial'
      /**
       * 显示房间人数
       */
      if (databus.gameStart == false) {
        if (databus.gameModel == 'double') {
          ctx.fillText(
            '房间人数： ' + databus.roomPeople,
            databus.gap + 0.5,
            screenHeight - databus.stepy
          )
        }
      }
    }

    /**
 * 画图标
 */
    if (databus.gameModel == 'single') {
      
      var iconLength = Math.round(databus.stepx * 8 / 23)
      var head = Math.round((databus.stepx * 8 - iconLength * 23) / 2) + databus.stepx + databus.gap
      databus.head = head
      databus.iconLength = iconLength
      var icons = [
        [0, 0], [0, 1], [0, 2], [0, 4], [0, 5], [0, 6], [0, 8], [0, 9], [0, 10], [0, 12], [0, 13], [0, 14], [0, 16], [0, 17], [0, 18], [0, 20], [0, 21], [0, 22],
        [1, 1], [1, 4], [1, 9], [1, 12], [1, 14], [1, 17], [1, 20],
        [2, 1], [2, 4], [2, 5], [2, 6], [2, 9], [2, 12], [2, 13], [2, 17], [2, 21],
        [3, 1], [3, 4], [3, 9], [3, 12], [3, 14], [3, 17], [3, 22],
        [4, 1], [4, 4], [4, 5], [4, 6], [4, 9], [4, 12], [4, 14], [4, 16], [4, 17], [4, 18], [4, 20], [4, 21], [4, 22]
      ]
      if (databus.frame % 5 == 0 && this.sum != 54) {
        var temp = Math.floor(Math.random() * 54)
        while (this.iconsFlag[temp] == 1) {
          temp = Math.floor(Math.random() * 54)
        }
        this.sum++
        this.iconsFlag[temp] = 1
        this.iconsShow.push(icons[temp])
      }


      for (var i = 0; i < this.iconsShow.length; i++) {
        var x = this.iconsShow[i][0]
        var y = this.iconsShow[i][1]
        if (y < 3) {
          context.fillStyle = '#c01317'

        } else if (y < 7) {
          context.fillStyle = '#ca7711'

        } else if (y < 11) {
          context.fillStyle = '#d0d718'

        } else if (y < 15) {
          context.fillStyle = '#72ae18'

        } else if (y < 19) {
          context.fillStyle = '#0072b8'

        } else {
          context.fillStyle = '#ce0fe8'

        }
        context.fillRect(head + iconLength * y, databus.stepy + iconLength * x, iconLength - 1, iconLength - 1)
      }
    }

    /**
     * 如果是在主界面就秀一下
     */
    if (1 == 0 && databus.frame % 2 == 0 && databus.gameStart == false && databus.gameModel == 'single') {
      var shows = []
      var size = 0
      for (var i = 0; i < databus.backgroundWidth; i++) {
        for (var j = 0; j < databus.backgroundLong; j++) {
          if (databus.ground[i][j] == -1 || databus.ground[i][j] >= 1) {
            continue
          }
          shows[size] = new Array()
          shows[size][0] = i
          shows[size][1] = j
          size = size + 1
        }
      }
      if (shows.length == 0) return
      var temp = shows[Math.floor(Math.random() * size)]
      var color = Math.floor(Math.random() * databus.colors.length)
      databus.ground[temp[0]][temp[1]] = 2
    }


/**
 * 显示排名
 */

    if (databus.rank == true) {
      context.fillStyle = "rgba(26,22,16,0.2)";
      context.fillRect(databus.gap + Math.round(databus.stepx * 0.5), context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy - stepy, screenWidth - 2 * (databus.gap + databus.stepx) + databus.stepx, screenHeight - 2 * (context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy - stepy))
      ctx.fillStyle = "#ffffff"
      ctx.font = Math.round(0.6 * databus.stepy) + "px Arial"

      ctx.fillText(
        '每周一凌晨更新',
        databus.gap + databus.stepx ,
        context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy - 5
      )

      if (network.getScoreRank == true) {
        var data = JSON.parse(network.RankData);
        
        length = data.length
        for (var i = 0; i < data.length && i < 5; i++) {
          this.nicknames[i] = data[i].nickname
          this.srcs[i] = data[i].imageUrl
          this.scores[i] = data[i].score
        }
        network.getScoreRank = false
      }

      context.fillStyle = 'white'
      for (var i = 0; i < length && i < 5; i++) {
        //名次
        ctx.fillText(
          '' + (i + 1),
          databus.gap + databus.stepx * 1 + 5,
          context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy + 2 * stepy + i * 2 * stepy - 7,
        )

        //头像
        if (this.srcs[i] != 0) {
          image[i].src = this.srcs[i]
        }
        
        ctx.drawImage(
          image[i],
          databus.gap + databus.stepx * 2,
          context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy + stepy + i * 2 * stepy,
          databus.stepx - 1,
          databus.stepy - 1
        )

        ctx.fillText(
          this.nicknames[i],
          databus.gap + databus.stepx * 3 + 5,
          context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy + 2 * stepy + i * 2 * stepy - 7,

        )

        //score
        ctx.fillText(
          '' + this.scores[i],
          databus.gap + databus.stepx * 8,
          context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy + 2 * stepy + i * 2 * stepy - 7,

        )
      }

      ctx.drawImage(
        image2,
        databus.gap + Math.round(databus.stepx * 8.5),
        context.canvas.height - stepx * databus.buttomGap - ((databus.backgroundLong - 1)) * stepy - stepy - Math.round(databus.stepy * 0.5),
        databus.stepx - 1,
        databus.stepy - 1
      )
    }
  }

  judgeEliminate() {
    //判断是否有可消除的行
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

  }
}









