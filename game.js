
// Add Object.extend, Object.copy, and Object.new
require('./jstools/tools.js')

Time = Class.extend(new function() {
  /*
   * The definitions below are hard
   * coded on the Universe for readability.
  Universe.triggers = []
  Universe.add = function(trigger) {
    this.triggers.push(trigger)
    return this
  }
  Universe.update = function() {
    for(var i in this.triggers)
      this.triggers[i].apply(this)
  }
  */

  // Add a trigger to update all Time objects.
  Universe.add(function() {
    var objs = this.objs
    for(var i in objs) {
      if(objs[i].instanceof(Time))
        objs[i].update()
    }
  })

  this.triggers = []
  this.add = function(trig) { this.triggers.push(trig) }
  this.update = function() {
    for(var i in this.triggers) {
      if(typeof this.triggers[i] !== 'function')
        console.log('Triggers:', this.triggers)
      else
      this.triggers[i].apply(this)
    }
  }
})

Alive = Time.extend({
  dead : false,
  ko : false,
  hp : 10,
  maxhp : 10,
  regen : 2,
  init : function(maxhp, regen) {
    this.hp = maxhp
    this.maxhp = maxhp
    this.regen = regen || maxhp / 5

    // Efeito passivo:
    this.add(
        function() {
          // KO condition:
          if( this.hp <= 0 )
            this.ko = true
          else
            this.ko = false

          // Death condition:
          if( this.hp < -this.maxhp )
            this.dead = true
          else
            this.dead = false

          // Regen process:
          if(this.hp < this.maxhp && !this.dead) {
            this.hp += this.regen
            if(this.hp > this.maxhp)
              this.hp = this.maxhp
          }
        }
      )
  }
})

Space = Class.extend(new function() {
  // Set the universe size:
  var _Space = {w:10, h:10}
  Universe.Space = function(w,h) {
    // With no args work as a getter:
    if(arguments.length===0)
      return Space.copy();

    // if w == Space == { w:#, h:# }
    if(arguments.length===1)
      if(typeof w === 'object' &&
         typeof w.w === 'number' && w.w >= 0 &&
         typeof w.h === 'number' && w.h >= 0)
        _Space = w

    if(arguments.length===2) {
      if(typeof w === 'number' && w >= 0)
        _Space.w = w
      if(typeof h === 'number' && h >= 0)
        _Space.h = h
    }

    // Update positions of objects to fit inside Space:
    for(var i in this.objs) {
      var obj = this.objs[i]
      // If it has x, y coordinates:
      if(obj.instanceof(Space)) {
        // Update x, y coords (it will fix x, y outside universe):
        obj.X(obj.X())
        obj.Y(obj.Y())
      }
    }
  }

  Universe.Draw = function() {
    process.stdout.write('\033c')
    var map = []
    for(var i=0; i < _Space.h; i++) {
      map.push([])
      for(var j=0; j < _Space.w; j++)
        map[i].push(' ')
    }

    for(var i in this.objs) {
      var obj = this.objs[i]
      if(obj.instanceof(Space)) {
        map[obj.Y()][obj.X()] = '#'
      }
    }

    process.stdout.write('.')
    for(var j=0; j < _Space.w; j++)
      process.stdout.write(' -')
    process.stdout.write('.\n')

    for(var i=0; i < _Space.h; i++) {
      process.stdout.write('|')
      for(var j=0; j < _Space.w; j++)
        process.stdout.write(map[i][j] + ' ')
      process.stdout.write('|\n')
    }

    process.stdout.write('°')
    for(var j=0; j < _Space.w; j++)
      process.stdout.write(' -')
    process.stdout.write('°\n')

  }

  this.init = function(x,y) {
    if(!x && this.x) x = this.x
    if(!y && this.y) y = this.y

    // The negation is in case x or y is undefined:
    if(!(x >= 0)) x = 0
    if(!(y >= 0)) y = 0
    if(x > _Space.w) x = _Space.w
    if(y > _Space.h) y = _Space.h

    this.x = x
    this.y = y

    this.X = function(x) {
      if(arguments.length===0) return this.x

      if(!(x >= 0)) x = 0
      if(x > _Space.w) x = _Space.w

      this.x = x
    }

    this.Y = function(y) {
      if(arguments.length===0) return this.y

      if(!(y >= 0)) y = 0
      if(y > _Space.w) y = _Space.w

      this.y = y
    }
  }
})

Dance = Space.extend({
  init : function(x,y) {
    var right = this.right
    var left = this.left
    var up = this.up
    var down = this.down

    var step=0;
    var steps = [
      right, right, right, right, up,
      left, left, left, left, down
    ]

    if(!this.instanceof(Time))
      this.apply(Time)

    this.add( function() {
      if(step == steps.length)
        step = 0;
      steps[step++].apply(this)
    })
  },

  left : function() { this.X(this.X()-1) },
  right : function() { this.X(this.X()+1) },
  up : function() { this.Y(this.Y()+1) },
  down : function() { this.Y(this.Y()-1) }
})














