class Branch {
  /**
   * @param {Object} options -
   * @param {Float} x - end x value
   * @param {Float} y - end y value
   * @param {Float} length - length value
   */
  constructor (options) {
    this.x = options.x
    this.y = options.y
    this.length = options.length
    this.ctx = options.ctx
    this.drawBranch()
  }
  /**
   * Draws the line onto canvas at specified coords
   */
  drawBranch () {
    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(this.x, this.y)
    this.ctx.stroke()
  }
}

class Tree {
  /**
   * @param {Object} options -
   * @param {HTMLElement} options.element -
   */
  constructor (options) {
    this.element = options.element
    this.canvas = this.element.querySelector('canvas')
    this.debug = document.querySelector('.debug')
    this.ctx = this.canvas.getContext('2d')
    this.rangeAngle = this.element.querySelector('.ctrl-angle')
    this.rangeMultiplier = this.element.querySelector('.ctrl-multiplier')
    this.branches = []
    this.settings = {}
    this.settings.angle = Math.PI / 4
    this.settings.maxAngle = Math.PI / 4
    this.settings.multiplier = 0.67
    this.settings.maxMultiplier = 0.67
    this.settings.maxStartLength = 100
    this.settings.length = 100
    this.debug = {}
    this.debug.runs = 0
    this.settings.cycle = 0.5
    this.settings.loop = {}
    this.settings.loop.interval = 60 / 1000 // fps / 1000 milliseconds
    this.settings.loop.now = 0
    this.settings.loop.then = Date.now()
    this.settings.loop.delta = 0
    this.setDebug()
    this.loop()

    this.setCanvasSize()

    window.addEventListener('resize', ::this.setCanvasSize)

    this.rangeAngle.addEventListener('input', event => {
      this.settings.angle = parseFloat(this.rangeAngle.value) * this.settings.maxAngle
      this.setDebug()
      this.draw()
    })
    this.rangeMultiplier.addEventListener('input', event => {
      this.settings.multiplier = this.rangeMultiplier.value * this.settings.maxMultiplier
      this.setDebug()
      this.draw()
    })

    this.canvas.addEventListener('mousemove', event => {
      let height = this.canvas.height
      let width = this.canvas.width
      let x = event.offsetX
      let y = event.offsetY
      //
      let posXPerc = x / width
      let posYPerc = y / height
      this.settings.multiplier = posYPerc * this.settings.maxMultiplier
      this.settings.angle = posXPerc * this.settings.maxAngle
      this.draw()
    })
  }

  /**
   * Draws onto the canvas
   * @param {Number} timestamp -
   */
  loop () {
    // Throttle FPS
    // http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
    this.settings.loop.req = requestAnimationFrame(::this.loop)
    this.settings.loop.now = Date.now()
    this.settings.loop.delta = this.settings.loop.now - this.settings.loop.then

    if (this.settings.loop.delta > this.settings.loop.interval) {
      this.setDebug()
      if (this.settings.cycle > 1) cancelAnimationFrame(this.settings.loop.req)
      this.draw()
      this.settings.angle = this.settings.cycle * this.settings.maxAngle
      this.settings.multiplier = this.settings.cycle * this.settings.maxMultiplier
      this.settings.length = this.settings.cycle * this.settings.maxStartLength
      this.settings.cycle = this.settings.cycle + 0.01
      // Update then value for next step
      this.settings.loop.then = this.settings.loop.now - (this.settings.loop.delta % this.settings.loop.interval)
    }
  }

  /**
   * Draws the branches
   */
  draw () {
    this.ctx.resetTransform()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.translate(this.canvas.width / 2, this.canvas.height)
    this.branch(this.settings.length)
    this.ctx.resetTransform()
    this.ctx.translate(this.canvas.width / 2, 0)
    this.ctx.rotate((Math.PI * -1))
    this.branch(this.settings.length)
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
  }

  /**
   * @param {Float} len - Length of branch
   */
  branch (len) {
    this.ctx.strokeStyle = 'brown'
    if (len <= 7) this.ctx.strokeStyle = 'green'
    this.ctx.lineWidth = 1
    if (len === this.settings.startLength) this.ctx.lineWidth = 5
    this.branches.push(
      new Branch(
        { x: 0,
          y: -len,
          ctx: this.ctx,
          length: len
        }
    ))
    this.ctx.translate(0, -len)
    if (len > 4) {
      this.ctx.save()
      this.ctx.rotate(this.settings.angle)
      this.branches.push(
        new Branch(
          { x: 0,
            y: -len,
            ctx: this.ctx,
            length: len
          }
      ))
      this.branch(len * this.settings.multiplier)
      this.ctx.restore()
      this.ctx.rotate(-this.settings.angle)
      this.branches.push(
        new Branch(
          { x: 0,
            y: -len,
            ctx: this.ctx,
            length: len
          }
      ))
      this.branch(len * this.settings.multiplier)
    }
  }

  /**
   * Sets canvas width to fit whole screen
   */
  setCanvasSize () {
    let elementBounds = this.element.getBoundingClientRect()
    this.canvas.width = elementBounds.width
    this.canvas.height = elementBounds.height
  }

/**
 * @param {Integer} min - minimum int
 * @param {Integer} max - maximum int
 * @returns {Integer} r - random integer -
 */
  getRandomInt (min, max) {
    let r = 0
    min = Math.ceil(min)
    max = Math.floor(max)
    r = Math.floor(Math.random() * (max - min)) + min
    return r
  }

  /**
   * Sets debug values
   */
  setDebug () {
    // this.debug.innerHTML =
    document.querySelector('.debug').innerHTML = `
      <span class='cycle'>Cycle: ${this.settings.cycle}</span>
      <span class='angle'>Angle: ${this.settings.angle} : ${typeof this.settings.angle}</span>
      <span class='multiplier'>Multiplier: ${this.settings.multiplier}</span>
    `
  }
}

export {Branch, Tree}
