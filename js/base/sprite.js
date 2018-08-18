/**
 * 游戏基础的精灵类
 */
import DataBus from '../databus'

let databus = new DataBus()


export default class Sprite {
  constructor() {
    this.canvas2 = wx.createCanvas()
  }
  
  reconstructor(imgSrc = '', width = 0, height = 0, x = 100, y = 100, num) {
    
    this.width = width
    this.height = height
    this.num = num
    this.length = Math.round(databus.stepx * 0.75)

    this.x = x
    this.y = y
    if (this.num == 2) {
      this.length = Math.round(databus.stepx * 6 / 19)
    }
    this.leftX = x
    this.leftY = y
    this.rightX = x
    this.rightY = y
    this.visible = true

    this.canvas2.width = canvas.width
    this.canvas2.height = canvas.height
    var context = this.canvas2.getContext('2d')
    var boxSpecies = Math.floor(Math.random() * databus.allBoxs.length)
    while (boxSpecies == 12) {
      boxSpecies = Math.floor(Math.random() * databus.allBoxs.length)
    }
    var boxPos = Math.floor(Math.random() * (databus.allBoxs[boxSpecies].length - 1))
    if (databus.random[this.num] == false) {
      boxSpecies = databus.boxSpecies[this.num]
      boxPos = databus.boxPos[this.num]
    }

    if (this.num != 2 && databus.random[this.num] == true && databus.sameNumber < databus.sameBoxSpecies.length) {
      boxSpecies = databus.sameBoxSpecies[databus.sameNumber]
      boxPos = databus.sameBoxPos[databus.sameNumber]
      databus.sameNumber = databus.sameNumber + 1
    }

    if (this.num == 2) {
      boxSpecies = 12
      boxPos = 0
    }

    this.boxSpecies = boxSpecies
    this.boxPos = boxPos

    /**
     * 找上下左右边界
     */
    for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
      this.leftX = Math.min(this.leftX, x + databus.allBoxs[boxSpecies][boxPos][i][0] * this.length)
      this.rightX = Math.max(this.rightX, x + databus.allBoxs[boxSpecies][boxPos][i][0] * this.length)

      this.leftY = Math.min(this.leftY, y + databus.allBoxs[boxSpecies][boxPos][i][1] * this.length)
      this.rightY = Math.max(this.rightY, y + databus.allBoxs[boxSpecies][boxPos][i][1] * this.length)
    }
    this.width = this.rightX - this.leftX + this.length
    this.height = this.rightY - this.leftY + this.length

    var color = databus.colors[databus.allBoxs[boxSpecies][(databus.allBoxs[boxSpecies].length - 1)][0]]
    context.fillStyle = color

    /** 
     * 
     * 绘制图
     */

    for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
      context.fillRect(x + databus.allBoxs[boxSpecies][boxPos][i][0] * this.length, y + databus.allBoxs[boxSpecies][boxPos][i][1] * this.length, this.length - 1, this.length - 1)
    }
    databus.boxSpecies[this.num] = boxSpecies
    databus.boxPos[this.num] = boxPos
  }

  changeBig() {
    var boxSpecies = this.boxSpecies
    var boxPos = this.boxPos
    var x = this.x
    var y = this.y
    this.length = databus.stepx
    if (this.num == 2) {
      x = databus.startX[2]
      this.x = x
      this.length = Math.round(databus.stepx * 6 / 19)
      this.length = 0.8 * this.length
      
    }

    this.canvas2.width = canvas.width
    this.canvas2.height = canvas.height
    var context = this.canvas2.getContext('2d')

    var color = databus.colors[databus.allBoxs[boxSpecies][(databus.allBoxs[boxSpecies].length - 1)][0]]
    context.fillStyle = color

    /**
     * 绘制图形
     */
    for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
      context.fillRect(x + databus.allBoxs[boxSpecies][boxPos][i][0] * this.length, y + databus.allBoxs[boxSpecies][boxPos][i][1] * this.length, this.length - 1, this.length - 1)
    }

    databus.boxSpecies[this.num] = boxSpecies
    databus.boxPos[this.num] = boxPos

    /**
     * 找上下左右边界值
     */

    this.leftX = x
    this.leftY = y
    this.rightX = x
    this.rightY = y
    for (var i = 0; i < databus.allBoxs[boxSpecies][boxPos].length - 1; i++) {
      this.leftX = Math.min(this.leftX, x + databus.allBoxs[boxSpecies][boxPos][i][0] * this.length)
      this.rightX = Math.max(this.rightX, x + databus.allBoxs[boxSpecies][boxPos][i][0] * this.length)

      this.leftY = Math.min(this.leftY, y + databus.allBoxs[boxSpecies][boxPos][i][1] * this.length)
      this.rightY = Math.max(this.rightY, y + databus.allBoxs[boxSpecies][boxPos][i][1] * this.length)
    }
  }


  /**
   * 将精灵图绘制在canvas上
   */
  drawToCanvas(ctx) {
    if (!this.visible)
      return
    ctx.drawImage(this.canvas2, this.leftX, this.leftY, this.rightX - this.leftX + this.length, this.rightY - this.leftY + this.length, this.x, this.y, this.rightX - this.leftX + this.length, this.rightY - this.leftY + this.length)
  }

}
