import Player from './player/index'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import NetWork from './network'
import Model from './model'
import Animation from './base/animation.js'
let ctx = canvas.getContext('2d')

let databus = new DataBus()
let network = new NetWork()
let model = new Model()

/**
 * 
 * 游戏主函数
 */
export default class Main {

  constructor() {
    wx.setEnableDebug({ enableDebug: true })
    setInterval(function () { 
      //console.log('yyy')
      databus.musicIndex = databus.musicIndex - 2
      if (databus.musicIndex < 0) {
        databus.musicIndex = 0
      }
     }, 8000);
    /**
     * 获取用户信息
     */
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女
        var province = userInfo.province
        var city = userInfo.city
        var country = userInfo.country
        //console.log(avatarUrl)
        databus.selfImageUrl = avatarUrl
        databus.selfNickName = nickName
      }
    })

    this.player = [0, 0, 0]          
    this.player[0] = new Player()   //左右俩可移动块
    this.player[1] = new Player()   //
    this.player[2] = new Player()  //start块
    this.restart()
    this.gameinfo = new GameInfo()
    this.ani = new Animation()
  }


  restart() {
    databus.reset()        //初始化全局变量
    this.firstTime = true
    this.firstTimeChangeToDoubleModel = true
    this.firstTimeOver = true
    this.firstReturnTime = true
    this.firstStart = true
    this.firstWaitPeople = true
    this.firstTimeGetRank = true
    this.firstTimeCloseRank = true

    canvas.removeEventListener(
      'touchstart',          //游戏结束后 重新开始 按钮
      this.touchHandler
    )

    canvas.removeEventListener(
      'touchcancelgamecanstart',        //可以取消准备
      this.touchCancelHandler
    )

    canvas.removeEventListener(
      'touchchangetodoublemodel',  //可以变换模式
      this.touchChangeHandler
    )

    canvas.removeEventListener(
      'touchgetrank',  //打开排名榜
      this.touchRankHandler
    )

    canvas.removeEventListener(
      'touchcloserank',  //关闭排名榜
      this.touchCloseRankHandler
    )

 

    this.bg = new BackGround(ctx)
    if (this.player[0].flag != 0) {
      this.player[0].x = 1000
      this.player[0].y = 1000
    }

    if (this.player[1].flag != 0) {
      this.player[1].x = 1000
      this.player[1].y = 1000
    }

/**
 * 表示play是否出现
 */
    this.player[0].flag = 0
    this.player[1].flag = 0
    this.player[2].flag = 0

    if (databus.gameStart == false) {    //如果游戏没有开始，则显示start

      this.player[2].rreconstructor(ctx, databus.startX[2], databus.startY[2], 2)
      this.player[2].flag = 1

    } else {   //游戏开始了，则出现俩可操作块

      this.player[0].rreconstructor(ctx, databus.startX[0], databus.startY[0], 0)
      this.player[0].flag = 1

      this.player[1].rreconstructor(ctx, databus.startX[1], databus.startY[1], 1)
      this.player[1].flag = 1

    }


    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )
  }



  //游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    if (this.player[0].flag != 0) {
      this.player[0].x = 1000
      this.player[0].y = 1000
      //databus.removePlayer(this.player[0])
    }

    if (this.player[1].flag != 0) {
      this.player[1].x = 1000
      this.player[1].y = 1000
      //databus.removePlayer(this.player[1])
    }
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY) {
      this.restart()
    }
  }

  

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {


/**
 * 控制音乐等级，是good还是great等等
 */
    if (databus.frame % 700 == 0) {   
      //console.log('yy')      
      //databus.musicIndex = databus.musicIndex - 2
      if (databus.musicIndex < 0) {
        databus.musicIndex = 0
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)


    if (databus.gameStart == false) {   //游戏没有开始，一直画start
      this.player[2].drawToCanvas(ctx)
    } else {   //游戏已经开始，画两个可以操纵的块
      if (this.player[0].flag == 0) {
        this.player[0].rreconstructor(ctx, databus.startX[0], databus.startY[0], 0)
        this.player[0].flag = 1

        this.player[1].rreconstructor(ctx, databus.startX[1], databus.startY[1], 1)
        this.player[1].flag = 1
      }
      this.player[0].drawToCanvas(ctx)
      this.player[1].drawToCanvas(ctx)
    }

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })
    if (databus.gameModel == 'single' && databus.gameStart == true)      //单人模式下显示分数
      this.gameinfo.renderGameScore(ctx, databus.score)
  }

  // 游戏逻辑更新主函数
  update() {
    this.bg.update()
  }

/**
 * 判断游戏是否结束，模拟每一次能放的地方，如果没有可以放的地方，则结束
 */
  judgeIsGameOver(time) {

    var boxSpecies = databus.boxSpecies[0]
    var boxPos = databus.boxPos[0]
    for (var posx = 0; posx < databus.backgroundWidth; posx++) {
      for (var posy = 0; posy < databus.backgroundLong; posy++) {
        var canShow = true
        for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
          var tempx = databus.allBoxs[boxSpecies][boxPos][i][0]
          var tempy = databus.allBoxs[boxSpecies][boxPos][i][1]
          if (posx + tempx < 0 || posx + tempx >= databus.backgroundWidth || posy + tempy < 0 || posy + tempy >= databus.backgroundLong || databus.ground[posx + tempx][posy + tempy] > 1 || databus.ground[posx + tempx][posy + tempy] == -1) {
            canShow = false
          }
        }
        if (canShow == true) {
          return
        }
      }
    }

    var boxSpecies = databus.boxSpecies[1]
    var boxPos = databus.boxPos[1]
    for (var posx = 0; posx < databus.backgroundWidth; posx++) {
      for (var posy = 0; posy < databus.backgroundLong; posy++) {
        var canShow = true
        for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
          var tempx = databus.allBoxs[boxSpecies][boxPos][i][0]
          var tempy = databus.allBoxs[boxSpecies][boxPos][i][1]
          if (posx + tempx < 0 || posx + tempx >= databus.backgroundWidth || posy + tempy < 0 || posy + tempy >= databus.backgroundLong || databus.ground[posx + tempx][posy + tempy] > 1 || databus.ground[posx + tempx][posy + tempy] == -1) {
            canShow = false
          }
        }
        if (canShow == true) {
          return
        }
      }
    }
    databus.gameOver = true
    if (databus.gameModel == 'double') {         //如果是双人模式，先死的扣50分
      databus.score = databus.score - 50
      databus.sendToSetScore()
    } else {  //如果是单人模式，则连接服务器，上传分数
      //databus.ws = new WebSocket('ws://192.168.56.1:8181')
      databus.ws = new WebSocket('ws://111.230.64.226:400')
      databus.ws.onopen = function () {
        databus.sendToSetScore()
        databus.ws.close()
      };
    }
    databus.time = time
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    

    if (databus.player[0] == false) {   //如果左边的块被使用了，则创造一个新块，并且判断游戏是否结束
      this.player[0].rreconstructor(ctx, databus.startX[0], databus.startY[0], 0)
      this.player[0].flag = 1
      databus.player[0] = true
      this.judgeIsGameOver(databus.frame)
    }
    if (databus.player[1] == false) {   //如果右边的块被使用了，则创造一个新块，并且判断游戏是否结束
      this.player[1].rreconstructor(ctx, databus.startX[1], databus.startY[1], 1)
      this.player[1].flag = 1
      databus.player[1] = true
      this.judgeIsGameOver(databus.frame)
    }
    if (databus.player[2] == false && databus.gameStart == false && databus.gameWait == false && databus.waitPeopleEnter == false) {
      databus.startX[2] = Math.round((window.innerWidth - 19 * Math.round(databus.stepx * 6 / 19)) / 2)
      this.player[2].rreconstructor(ctx, databus.startX[2], databus.startY[2], 2)
      this.player[2].flag = 1
      databus.player[2] = true
    }
    if (databus.gameWait == true || databus.waitPeopleEnter == true) {
      this.player[2].x = 1000
      this.player[2].y = 1000
      databus.player[2] = false
    }

    if (network.shouldChangeEnemy == true) {  //如果对方发来了消息，一定是双人模式下，则进行json解析

      var numberList = []
      var enemyData = JSON.parse(network.shouldChangeEnemyData);

      if (enemyData.from == 'User') {
        if (databus.enemyNickName != enemyData.nickName || databus.enemyImageUrl != enemyData.imageUrl) {      //记录对方nickname和头像
          databus.enemyImageUrl = enemyData.imageUrl
          databus.enemyNickName = enemyData.nickName
        }
      }

      if (enemyData.from == 'MyServer' && enemyData.gameCanStart == true) {    //如果服务器说游戏开始
        /**
         * 取同步的块
         */
        var k = 0
        var temp = 0
        for (var i = 0; i < enemyData.sameBoxSpecies.length; i++) {

          if (enemyData.sameBoxSpecies[i] == ' ') {
            databus.sameBoxSpecies[k] = temp
            temp = 0
            k = k + 1
          } else {
            temp = temp * 10 + (enemyData.sameBoxSpecies[i] - '0')
          }
        }

        k = 0
        var temp = 0
        for (var i = 0; i < enemyData.sameBoxPos.length; i++) {
          if (enemyData.sameBoxPos[i] == ' ') {
            databus.sameBoxPos[k] = temp
            temp = 0
            k = k + 1
          } else {
            temp = temp * 10 + (enemyData.sameBoxPos[i] - '0')
          }
        }

        databus.gameCanStart = false
        databus.gameStart = true
        databus.gameWait = false
        databus.waitPeopleEnter = false
        let music = new Music()    //ready go
        music.playBgm()
        canvas.removeEventListener(
          'touchcancelgamecanstart',
          this.touchCancelHandler
        )
      }


      /**
       * 如果自己可以开始了，但是服务器不让开始（对方没有准备），则进入等待状态
       */
      if (enemyData.from == 'MyServer' && enemyData.gameCanStart == false && databus.gameCanStart == true && databus.waitPeopleEnter == false) {
        databus.gameWait = true
      }

      /**
       * 取当前房间人数
       */

      databus.roomPeople = enemyData.roomPeople
      if (databus.roomPeople == 1 && databus.gameStart == false) {
        databus.waitPeopleEnter = true
        databus.gameWait = false
      } else {
        databus.waitPeopleEnter = false
      }

      /**
        * 取对方ground
        */
      if (enemyData.gameOver != true) {
        var negative = false
        var temp = 0
        var k = 0
        for (var i = 0; i < enemyData.groundMessage.length; i++) {
          if (enemyData.groundMessage[k] == ' ') {
            if (negative == true) {
              temp = temp * -1
            }
            numberList.push(temp)
            temp = 0
            negative = false
          } else if (enemyData.groundMessage[k] == '-') {
            negative = true
          } else {
            temp = temp * 10 + (enemyData.groundMessage[k] - '0')
          }
          k++
        }
        var t = 0
        k = 0
        for (var i = 0; i < databus.backgroundWidth; i++) {
          for (var j = 0; j < databus.backgroundLong; j++) {
            databus.enemyGround[i][j] = numberList[k]
            k = k + 1
          }
        }
      }

      /**
       * 取对方是否已经挂了
       */
      if (databus.gameStart == true) {
        databus.gameOver = enemyData.gameOver
        if (databus.gameOver == true) {
          console.log('enemy have died')
          databus.enemyScore = databus.enemyScore - 50        //对方先死，他扣50分
          databus.sendToSetScore()     //告知服务器上传分数
        } else {
          databus.enemyScore = enemyData.score
        }
      }

      if (databus.gameCanStart == true && enemyData.gameOver == true) {
        databus.gameCanStart = false
        databus.sendToEnemy()
        databus.sendToSetScore()
      }

      /**
       * 
       * 取对方已经消除的行数,每三行打一个洞
       */

      var enemyHaveEliminate = enemyData.haveEliminate
      if (Math.floor(enemyHaveEliminate / 3) > databus.hole) {
        this.getHole()
      }

      network.should = false
      network.shouldChangeEnemy = false
    }

    /**
     * 监听 返回主页 按钮
     */

    if (databus.gameModel == 'single' && databus.gameStart == false) {

    } else {
      this.gameinfo.returnHome(ctx)
    }

    if (databus.returnHome == true) {
      this.touchReturnHandler = this.touchReturnHomeEventHandler.bind(this)
      canvas.addEventListener('touchreturnhome', this.touchReturnHandler)
      databus.returnHome = false
    }

    
    // 游戏结束停止帧循环
    if (databus.gameOver) {
      if (databus.frame - databus.time > 24) {
        if (databus.model == 'double') {
          databus.sendToEnemy()
        }
        this.gameinfo.renderGameOver(ctx, databus.score, databus.enemyScore)
        if (this.firstTimeOver == true) {
          this.touchHandler = this.touchEventHandler.bind(this)
          canvas.addEventListener('touchstart', this.touchHandler)
          this.firstTimeOver = false
        }
        return
      }
    }

    /**
        * 等待状态时监听 取消准备 按钮
        */

    if (databus.gameWait == true) {
      this.gameinfo.cancelGameCanStart(ctx, '正在等待对方准备', '取消准备')

      if (this.firstTime == true) {
        this.touchCancelHandler = this.touchCancelGameCanStartEventHandler.bind(this)
        canvas.addEventListener('touchcancelgamecanstart', this.touchCancelHandler)
        this.firstTime = false
      }
    }


    if (databus.waitPeopleEnter == true) {
      ctx.fillStyle = "#000000"
      ctx.font = "20px Arial"

      ctx.fillText(
        '正在等待对手进入房间',
        Math.round((window.innerWidth - 19 * Math.round(databus.stepx * 6 / 19)) / 2),
        databus.startY[2] + databus.stepy,
      )
    }

    /**
     * 监听切换 多人游戏 按钮
     */

    if (databus.gameModel == 'single' && databus.gameStart == false) {

      this.gameinfo.changeToDoubleModel(ctx)
      

      if (this.firstTimeChangeToDoubleModel == true) {
        this.touchChangeHandler = this.touchChangeToDoubleModelEventHandler.bind(this)
        canvas.addEventListener('touchchangetodoublemodel', this.touchChangeHandler)
        this.firstTimeChangeToDoubleModel = false
      }


      this.gameinfo.getRank(ctx)
      if (this.firstTimeGetRank == true) {
        this.touchRankHandler = this.touchRanktHandler.bind(this)
        canvas.addEventListener('touchgetrank', this.touchRankHandler)
        this.firstTimeGetRank = false
      }

      if (this.firstTimeCloseRank == true) {
        this.touchCloseRankHandler = this.touchCloseRankHandler.bind(this)
        canvas.addEventListener('touchcloserank', this.touchCloseRankHandler)
        this.firstTimeCloseRank = false
      }


    }


    if (this.firstStart == true && databus.gameStart == true) {
      canvas.removeEventListener(
        'touchchangetodoublemodel',  //可以变换模式
        this.touchChangeHandler
      )
      this.firstStart = false
    }

    window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )

  }

  touchReturnHomeEventHandler(e) {     //返回首页
    e.preventDefault()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnReturnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY && databus.rank == false) {
      if (databus.ws != 0) {
        databus.ws.close()
      }
      console.log('点击了返回主页')
      model.gameModel = 'single'
      this.restart()
    }
  }


  touchCancelGameCanStartEventHandler(e) {     //取消准备
    e.preventDefault()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnCancelGameCanStartArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY) {
      console.log('点击了取消准备')
      databus.ws.close()
      this.restart()
    }
  }


  touchChangeToDoubleModelEventHandler(e) {   //切换游戏模式
    e.preventDefault()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnChangeToDoubleModelArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY &&  databus.rank == false) {
      model.gameModel = 'double'
      this.restart()
    }
  }


  touchRanktHandler(e) {         //打开排名榜
    e.preventDefault()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnLookRank

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY && databus.gameStart == false) {
        if(databus.rank == false) {
          databus.rank = true
          var that = this
          //this.ws = new WebSocket('ws://192.168.56.1:8181')
          this.ws = new WebSocket('ws://119.28.130.119:400')

          that.ws.onopen = function () {
            that.sendToGetScoreNumber()
          };

          that.ws.onmessage = function (evt) {
            network.getScoreRank = true
            network.RankData = evt.data
          };
        } else {
          databus.rank = false
          this.ws.close()
        }
    }
  }

  touchCloseRankHandler(e) {   //关闭排名榜
    e.preventDefault()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnCloseRank
    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY && databus.rank == true) {
      databus.rank = false
      this.ws.close()
    }
  }


  getHole() {
    /**
     * 随机获得一个洞洞
     */
    var canChangeToHoleList = []
    var size = 0
    for (var i = 0; i < databus.backgroundWidth; i++) {
      for (var j = 0; j < databus.backgroundLong; j++) {
        if (databus.ground[i][j] == -1 || databus.ground[i][j] >= 1) {
          continue
        }
        canChangeToHoleList[size] = new Array()
        canChangeToHoleList[size][0] = i
        canChangeToHoleList[size][1] = j
        size = size + 1
      }
    }
    if (canChangeToHoleList.length == 0) return
    var temp = canChangeToHoleList[Math.floor(Math.random() * size)]
    databus.ground[temp[0]][temp[1]] = -1
    databus.hole = databus.hole + 1
    databus.sendToEnemy()
    this.ani.init()   //打洞特效动画
    this.ani.playAnimation(0, false, temp[0], temp[1])
    let music = new Music()
    music.playHole()
    this.judgeIsGameOver(databus.frame)
  }

  sendToGetScoreNumber() {            //自己构造json格式，发送请求获取排名榜
    var jsonData = ''
    jsonData += "{"
    jsonData += "\"from\"" + ":" + "\"getScore\""
    jsonData += "}"
    this.ws.send(jsonData)
  }
}
