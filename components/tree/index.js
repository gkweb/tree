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
    this.ctx.closePath()
  }
}

class Leaf {
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
    this.angle = Math.PI
    this.drawLeaf()
  }
  /**
   * Draws the ellipse onto canvas at specified coords
   */
  drawLeaf () {
    // this.ctx.ellipse(this.x, this.y, this.x + 20, this.y + 20, 0, 45 * Math.PI/180, 0, 2 * Math.PI)
    this.ctx.fillStyle = 'lightgreen'
    this.ctx.fillRect(this.x, this.y, 5, 5)
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
    this.btnGenerate = this.element.querySelector('.generate')
    this.branches = []
    this.leaves = []
    this.settings = {}
    this.settings.angle = Math.PI / 4
    this.settings.maxAngle = Math.PI / 4
    this.settings.multiplier = 0.67
    this.settings.maxMultiplier = 0.67
    this.settings.maxStartLength = this.canvas.height / 4
    // Store random values for performance
    // Also feels more fluid when interacting
    this.settings.random = []
    this.genRandomValues()
    this.settings.length = this.canvas.height / 4
    this.debug = {}
    this.debug.runs = 0
    this.settings.cycle = 0.5
    this.settings.count = 0
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
    this.btnGenerate.addEventListener('click', event => {
      this.genRandomValues()
      this.settings.cycle = 0.5
      this.loop()
    })
    this.rangeMultiplier.addEventListener('input', event => {
      this.settings.multiplier = this.rangeMultiplier.value * this.settings.maxMultiplier
      this.draw()
      this.setDebug()
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
      this.setDebug()
    })
  }

  /**
   * Regenerates random values. Tree angles are multipled by randomness
   */
  genRandomValues () {
    this.settings.random = []
    this.settings.random.push(Math.random())
    this.settings.random.push(Math.random())
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
    this.settings.count = 0
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.translate(this.canvas.width / 2, this.canvas.height)
    this.branch(this.settings.length)
  }

  /**
   * @param {Float} len - Length of branch
   */
  branch (len) {
    this.settings.count++
    this.ctx.strokeStyle = 'saddlebrown'
    if (len <= 7) this.ctx.strokeStyle = '#006400'
    // Calc line width as percentage of max linewidth
    this.ctx.lineWidth = (len / this.settings.length) * 10
    this.branches.push(
      new Branch({
        x: 0,
        y: -len,
        ctx: this.ctx,
        length: len
      }
    ))
    this.ctx.translate(0, -len)
    if (len > 7) {
      this.ctx.save()
      this.ctx.rotate(this.settings.angle * this.settings.random[0])
      this.branches.push(
        new Branch({
          x: 0,
          y: -len * this.settings.multiplier,
          ctx: this.ctx,
          length: len * this.settings.multiplier
        }
      ))
      this.branch(len * this.settings.multiplier)
      this.ctx.restore()
      this.ctx.rotate(-this.settings.angle * this.settings.random[1])
      this.branches.push(
        new Branch({
          x: 0,
          y: -len * this.settings.multiplier,
          ctx: this.ctx,
          length: len * this.settings.multiplier
        }
      ))
      this.branch(len * this.settings.multiplier)
    } else {
      this.leaves.push(new Leaf({
        x: 0,
        y: -len,
        ctx: this.ctx,
        length: 5
      })
      )
    }
  }

  /**
   * Sets canvas width to fit whole screen
   */
  setCanvasSize () {
    let elementBounds = this.element.getBoundingClientRect()
    this.canvas.width = elementBounds.width
    this.canvas.height = elementBounds.height
    this.draw()
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
      <span class='cycle'>Count: ${this.settings.count}</span>
      <span class='cycle'>Cycle: ${this.settings.cycle}</span>
      <span class='angle'>Angle: ${this.settings.angle} : ${typeof this.settings.angle}</span>
      <span class='multiplier'>Multiplier: ${this.settings.multiplier}</span>
    `
  }
}

export {Branch, Tree, Leaf}
