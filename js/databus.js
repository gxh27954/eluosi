
import NetWork from './network'
import Model from './model'
let instance
let ctx = canvas.getContext('2d')
let network = new NetWork()
let model = new Model()


const screenWidth = window.innerWidth
const screenHeight = window.innerHeight


/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if (instance)
      return instance

    instance = this

    this.returnHome = true
    this.selfNickName = ''
    this.selfImageUrl = ''
    this.enemyNickName = ''
    this.enemyImageUrl = ''
  }

  reset() {
    /**
     * 确定了左右间隙，需要为整数，不然边框有问题
     */
    this.buttomGap = 6
    this.gap = 20   //左边间隙20像素
    this.backgroundLong = 10   //横竖都是十行
    this.backgroundWidth = 10
    this.stepx = (screenWidth - 40) / this.backgroundWidth   //每一格子的大小=屏幕宽度-40 除以 格子数
    this.stepx = Math.round(this.stepx)
    this.stepy = this.stepx
    this.gap = (screenWidth - this.stepx * this.backgroundWidth) / 2
    this.gap = Math.round(this.gap)
    this.gapRight = screenWidth - this.gap - this.backgroundWidth * this.stepx
    this.startX = [this.gap + 4 * this.stepx, this.gap + 6 * this.stepx, Math.round((window.innerWidth - 19 * Math.round(this.stepx * 6 / 19)) / 2)]
    this.startY = [screenHeight - (this.buttomGap - 2) * this.stepy + 3 * Math.round(this.stepy * 0.75), screenHeight - (this.buttomGap - 2) * this.stepy + 3 * Math.round(this.stepy * 0.75), screenHeight - (this.buttomGap - 2) * this.stepy]


    this.stepy2 = Math.round(((screenHeight - this.stepx * this.buttomGap - this.backgroundLong * this.stepx + this.stepx) - 10 - 10) / this.backgroundLong)
    this.stepx2 = this.stepy2
    this.startY2 = Math.round(((screenHeight - this.stepx * this.buttomGap - this.backgroundWidth * this.stepx + this.stepx) - this.backgroundLong * this.stepy2) / 2)
    this.startX2 = screenWidth - (screenWidth - this.gap - this.backgroundWidth * this.stepx + this.stepx2 * this.backgroundWidth)


    this.gameModel = model.gameModel
    this.random = [true, true]
    this.player = [true, true]
    this.boxSpecies = [-1, -1, 12]
    this.boxPos = [-1, -1, 0]
    this.nowx = -1
    this.nowy = -1
    this.ground = []
    this.enemyGround = []
    this.frame = 0
    this.score = 0
    this.bullets = []
    this.enemys = []
    this.animations = []
    this.gameOver = false
    this.gameStart = false
    this.gameCanStart = false
    this.rank = false
    this.length = 25
    this.time = 0
    this.haveEliminate = 0
    this.hole = 0
    this.enemyScore = 0
    this.roomPeople = 0
    this.gameWait = false
    this.sameBoxSpecies = []
    this.sameBoxPos = []
    this.sameNumber = 0
    this.head = 0
    this.iconLength = 0
    this.musicIndex = 0

    if (this.gameModel == 'double') {
      this.waitPeopleEnter = true
    } else {
      this.waitPeopleEnter = false
    }
    
    /**
     * 初始化格子，全为0
     */
    for (var i = 0; i < this.backgroundWidth; i++) {
      this.ground[i] = new Array()
      this.enemyGround[i] = new Array()
      for (var j = 0; j < this.backgroundLong; j++) {
        this.ground[i][j] = 0
        this.enemyGround[i][j] = 0
      }
    }

    //如果双人模式，连接服务器
    this.ws = 0
    if (this.gameModel == 'double') {
      var that = this
      //this.ws = new WebSocket('ws://192.168.56.1:8181')
      this.ws = new WebSocket('ws://119.28.130.119:400')

      this.ws.onopen = function () {
          that.sendToEnemy()   
      };

      this.ws.onmessage = function (evt) {
        network.shouldChangeEnemy = true
        network.shouldChangeEnemyData = evt.data
      };
      this.ws.onclose = function () {
        this.gameOver = true
        this.gameStart = false
        this.gameCanStart = false
        console.log('closed....');
      };
    }

/**
 * 所有的块种类以及各种形态，用相对坐标表示
 */
    this.colors = ['#edeae1', '#CC6666', '#42d5ff', '#ffce33', '#ff639a', '#33E3FF', '#16dcb0', '#c78dfe', '#4169E1', '#8B7500', '#ff7663', '#62da56', '#ffa633', '#c78dfe']
    this.allBoxs = [
      [      //方块,标记2
        [[0, 0], [0, 0 + 1], [0 + 1, 0], [0 + 1, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 + 1], [0 + 1, 0], [0 + 1, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 + 1], [0 + 1, 0], [0 + 1, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 + 1], [0 + 1, 0], [0 + 1, 0 + 1], [0, 0]],
        [2]
      ],

      [      //竖条4格子,标记3
        [[0, 0], [0 + 1, 0], [0 + 2, 0], [0 + 3, 0], [0, 0]],
        [[0, 0], [0, 0 + 1], [0, 0 + 2], [0, 0 + 3], [0, 0]],
        [3]
      ],

      [      //L,标记4
        [[0, 0], [0, 0 + 1], [0, 0 + 2], [0 + 1, 0 + 2], [0, 0]],
        [[0, 0], [0 + 1, 0], [0 + 2, 0], [0 + 2, 0 - 1], [0, 0 - 1]],
        [[0, 0], [0 + 1, 0], [0 + 1, 0 + 1], [0 + 1, 0 + 2], [0, 0]],
        [[0, 0], [0, 0 - 1], [0 + 1, 0 - 1], [0 + 2, 0 - 1], [0, 0 - 1]],
        [4]
      ],

      [      //| - -,标记5
        [[0, 0], [0, 0 + 1], [0 + 1, 0 + 1], [0 + 2, 0 + 1], [0, 0]],
        [[0, 0], [0 + 1, 0], [0 + 1, 0 - 1], [0 + 1, 0 - 2], [0, 0 - 2]],
        [[0, 0], [0 + 1, 0], [0 + 2, 0], [0 + 2, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 - 1], [0, 0 - 2], [0 + 1, 0 - 2], [0, 0 - 2]],
        [5]
      ],

      [      //T,标记6
        [[0, 0], [0 + 1, 0], [0 + 1, 0 - 1], [0 + 2, 0], [0, 0 - 1]],
        [[0, 0], [0, 0 - 1], [0 - 1, 0 - 1], [0, 0 - 2], [0 - 1, 0 - 2]],
        [[0, 0], [0 - 1, 0], [0 - 1, 0 + 1], [0 - 2, 0], [0 - 2, 0]],
        [[0, 0], [0, 0 + 1], [0 + 1, 0 + 1], [0, 0 + 2], [0, 0]],
        [6]
      ],

      [      //z,标记7
        [[0, 0], [0 + 1, 0], [0 + 1, 0 - 1], [0 + 2, 0 - 1], [0, 0 - 1]],
        [[0, 0], [0, 0 - 1], [0 - 1, 0 - 1], [0 - 1, 0 - 2], [0 - 1, 0 - 2]],
        [[0, 0], [0 + 1, 0], [0 + 1, 0 - 1], [0 + 2, 0 - 1], [0, 0 - 1]],
        [[0, 0], [0, 0 - 1], [0 - 1, 0 - 1], [0 - 1, 0 - 2], [0 - 1, 0 - 2]],
        [7]
      ],

      [      //反z,标记8
        [[0, 0], [0 + 1, 0], [0 + 1, 0 + 1], [0 + 2, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 - 1], [0 + 1, 0 - 1], [0 + 1, 0 - 2], [0, 0 - 2]],
        [[0, 0], [0 + 1, 0], [0 + 1, 0 + 1], [0 + 2, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 - 1], [0 + 1, 0 - 1], [0 + 1, 0 - 2], [0, 0 - 2]],
        [8]
      ],

      [
        [[0, 0], [0 + 1, 0], [0 + 1, 0 + 1], [0, 0]],
        [[0, 0], [0, 0 + 1], [0 + 1, 0 + 1], [0, 0]],
        [9]
      ],

      [      //竖条3格子,标记3
        [[0, 0], [0 + 1, 0], [0 + 2, 0], [0, 0]],
        [[0, 0], [0, 0 + 1], [0, 0 + 2], [0, 0]],
        [10]
      ],

      [      //竖条2格子,标记10
        [[0, 0], [0 + 1, 0], [0, 0]],
        [[0, 0], [0, 0 + 1], [0, 0]],
        [11]
      ],

      [      //竖条1格子,标记3
        [[0, 0], [0, 0]],
        [[0, 0], [0, 0]],
        [12]
      ],
      /*
            [      //竖条2格子,标记10
              [[0, 0], [0 + 1, 0], [0, 0]],
              [[0, 0], [0, 0 + 1], [0, 0]],
              [11]
            ],
      
            [      //竖条1格子,标记3
              [[0, 0], [0, 0]],
              [[0, 0], [0, 0]],
              [12]
            ],*/

      [
        [[0, 0], [0, 0 + 1], [0, 0 + 2], [0 + 1, 0 + 2], [0 + 2, 0 + 2], [0, 0]],
        [[0, 0], [0 + 1, 0], [0 + 2, 0], [0 + 2, 0 - 1], [0 + 2, 0 - 2], [0, 0 - 2]],
        [[0, 0], [0 + 1, 0], [0 + 1, 0 + 1], [0 + 1, 0 + 2], [0 - 1, 0], [0 - 1, 0]],
        [[0, 0], [0, 0 - 1], [0 + 1, 0 - 1], [0 + 2, 0 - 1], [0, 0 + 1], [0, 0 - 1]],
        [13]
      ],

      [
        [[0, 0], [0 + 1, 0], [0 + 2, 0], [0 + 4, 0], [0 + 5, 0], [0 + 6, 0], [0 + 8, 0], [0 + 9, 0], [0 + 10, 0], [0 + 12, 0], [0 + 13, 0], [0 + 14, 0], [0 + 16, 0], [0 + 17, 0], [0 + 18, 0],
        [0, 0 + 1], [0 + 5, 0 + 1], [0 + 8, 0 + 1], [0 + 10, 0 + 1], [0 + 12, 0 + 1], [0 + 14, 0 + 1], [0 + 17, 0 + 1],
        [0 + 1, 0 + 2], [0 + 5, 0 + 2], [0 + 8, 0 + 2], [0 + 9, 0 + 2], [0 + 10, 0 + 2], [0 + 12, 0 + 2], [0 + 13, 0 + 2], [0 + 17, 0 + 2],
        [0 + 2, 0 + 3], [0 + 5, 0 + 3], [0 + 8, 0 + 3], [0 + 10, 0 + 3], [0 + 12, 0 + 3], [0 + 14, 0 + 3], [0 + 17, 0 + 3],
        [0, 0 + 4], [0 + 1, 0 + 4], [0 + 2, 0 + 4], [0 + 5, 0 + 4], [0 + 8, 0 + 4], [0 + 10, 0 + 4], [0 + 12, 0 + 4], [0 + 14, 0 + 4], [0 + 17, 0 + 4], [0, 0]],

        [13]
      ],
    ]
  }

/**
 * 告诉敌人我现在的信息
 * 发给服务器做中转
 */
  sendToEnemy() {
    var jsonData = ''
    /**
     * 构造场地
     */
    var groundMessage = ''
    for (var i = 0; i < this.backgroundWidth; i++) {
      for (var j = 0; j < this.backgroundLong; j++) {
        groundMessage = groundMessage + this.ground[i][j] + ' '
      }
    }

    jsonData += "{"
    jsonData += "\"from\"" + ":" + "\"User\"" + ","
    jsonData += "\"gameCanStart\"" + ":" + this.gameCanStart + ","
    jsonData += "\"gameStart\"" + ":" + this.gameStart + ","
    jsonData += "\"gameOver\"" + ":" + this.gameOver +  ","

    jsonData += "\"nickName\"" + ":" + "\"" + this.selfNickName + "\"" + ","
    jsonData += "\"imageUrl\"" + ":" + "\"" + this.selfImageUrl + "\"" + ","

    jsonData += "\"roomPeople\"" + ":" + this.roomPeople + ","
    jsonData += "\"groundMessage\"" + ":" + "\"" + groundMessage + "\"" + "," ///
    jsonData += "\"score\"" + ":" + this.score + ","
    jsonData += "\"haveEliminate\"" + ":" + this.haveEliminate + ","
    jsonData += "\"hole\"" + ":" + this.hole + ""
    jsonData += "}"

    this.ws.send(jsonData)
  }

/**
 * 告诉服务器我这局的分数
 */
  sendToSetScore() {
    var jsonData = ''
    jsonData += "{"
    jsonData += "\"nickName\"" + ":" + "\"" + this.selfNickName + "\"" + ","
    jsonData += "\"imageUrl\"" + ":" + "\"" + this.selfImageUrl + "\"" + ","
    jsonData += "\"score\"" + ":" + this.score + ","
    jsonData += "\"from\"" + ":" + "\"setScore\""
    jsonData += "}"
    this.ws.send(jsonData)
  }

}


