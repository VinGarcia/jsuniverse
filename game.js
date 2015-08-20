
// Add Object.extend, Object.copy, and Object.new
require('./jstools/tools.js')

Time = Class.extend(new function() {
  // /*
  // * The definitions below are hard
  // * coded on the Universe for readability.
  Universe.triggers = []
  Universe.add = function(trigger) {
    this.triggers.push(trigger)
    return this
  }
  Universe.update = function() {
    for(var i in this.triggers)
      this.triggers[i].apply(this)
  }
  Universe.start = function() {
    function update(){ Universe.update() }
    setInterval(update, 500)
  }
  // */

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
    if(arguments.length===0)
      return _Space.copy()

    if(arguments.length===1 && typeof w == 'object') {
      Universe.Space.W(w.w)
      Universe.Space.H(w.h)
    }

    if(arguments.length===2) {
      Universe.Space.W(w)
      Universe.Space.H(h)
    }
  }

  Universe.Space.W = function(w) {
    // With no args work as a getter:
    if(arguments.length===0)
      return _Space.w

    if(typeof w === 'number' && w >= 0)
      _Space.w = w

    // Force all objs to stay inside space:
    for(var i in Universe.objs) {
      var obj = Universe.objs[i]
      // If it has x, y coordinates:
      if(obj.instanceof(Space)) {
        // Update x coord (it will keep x inside universe)
        obj.X(obj.X())
      }
    }
  }

  Universe.Space.H = function(h) {
    // With no args work as a getter:
    if(arguments.length===0)
      return _Space.h

    if(typeof h === 'number' && h >= 0)
      _Space.h = h

    // Force all objs to stay inside space:
    for(var i in Universe.objs) {
      var obj = Universe.objs[i]
      // If it has x, y coordinates:
      if(obj.instanceof(Space)) {
        // Update y coord (it will keep y inside universe)
        obj.Y(obj.Y())
      }
    }
  }

  Universe.Draw = function() {
    // Clean screen:
    process.stdout.write('\033c')

    // Build the map:
    var map = []
    for(var i=0; i < _Space.h; i++) {
      map.push([])
      for(var j=0; j < _Space.w; j++)
        map[i].push(' ')
    }

    // Fill the map with objects:
    for(var i in this.objs) {
      var obj = this.objs[i]
      if(obj.instanceof(Space)) {
        var x = Math.round(obj.X())
        var y = Math.round(obj.Y())

        // Ask the obj to draw itself:
        var draw = obj.Draw()
        for(var symbol in draw) {
          if(symbol.length==0) continue
          for(var p in draw[symbol]) {
            p = draw[symbol][p]

            // Check if _x and _y are inside the universe:
            var _x = x+p[0], _y = y+p[1]
            if(_x < 0 || _y < 0 || _x >= _Space.w || _y >= _Space.h) continue

            map[_y][_x] = symbol[0] // If symbol has more than 1 character ignore the rest
          }
        }
      }
    }

    // Draw the top line:
    process.stdout.write('.')
    for(var j=0; j < _Space.w; j++)
      process.stdout.write(' -')
    process.stdout.write('.\n')

    // Draw the map:
    for(var i=0; i < _Space.h; i++) {
      process.stdout.write('|')
      for(var j=0; j < _Space.w; j++)
        process.stdout.write(map[i][j] + ' ')
      process.stdout.write('|\n')
    }

    // Draw the bottom line:
    process.stdout.write('°')
    for(var j=0; j < _Space.w; j++)
      process.stdout.write(' -')
    process.stdout.write('°\n')

  }

  // Draw a hash on the current position:
  this.Draw = function() { return { '#':[[0,0]] } }

  this.x = 0
  this.y = 0
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
      if(x > _Space.w-1) x = _Space.w-1

      this.x = x
    }

    this.Y = function(y) {
      if(arguments.length===0) return this.y

      if(!(y >= 0)) y = 0
      if(y > _Space.h-1) y = _Space.h-1

      this.y = y
    }
  }
})

Body = Space.extend(new function() {
  this.Draw = function() {
    return { '#' : this.pixels }
  }

  this.init = function(body) {
    // Two lists of points (x,y) in space:
    // The center of the body is set at (0,0)
    // Negative points are allowed
    var _body, _pixels

    // Check if body is in a valid format:
    _body = body_check(body)

    // Generate the pixel representation of the object:
    var _pixels = this.generatePixels(_body)
    this.pixels = _pixels.copy()

    // Declare getters and setters:
    this.Pixels = function() { return _pixels.copy() }
    this.Body = function(body) {
      if(arguments.length == 0)
        return _body.copy()

      _body = body_check(body)
      _pixels = this.generatePixels(_body)

      // Update pixels public instance:
      this.pixels = _pixels.copy()
      return this
    }

    function body_check(body) {
      var _body, body_ok = true

      if(typeof body != 'object')
        body_ok = false
      else
        for(var i in body) {
          if(typeof body[i] != 'object'||
              body[i].length != 2 ||
              typeof body[i][0] != 'number' ||
              typeof body[i][1] != 'number'
            )
          body_ok = false
        }

      if(!body_ok && _body == undefined)
        _body = [[0,0]]
      else
        // Copy it so no one can alter it from outside:
        _body = body.copy()

      return _body
    }
  }

  this.generatePixels = function(body) {
    // List of (x,y) coordinates:
    var pixels = []
    var points = body.splice(1)

    // The last point must be same as the first (to form a polygon):
    points.push(body[0])
    // console.log('points:', points)

    var last = body[0]

    // For each point:
    for(var i in points) {
      var p = points[i]

      // Add this point to the pixels list:
      pixels.push([Math.round(p[0]), Math.round(p[1])])
      
      // Check which axis change most between `last` and `p`:
      if(Math.abs(last[0]-p[0]) > Math.abs(last[1]-p[1])) {
        var i1 = 0
        var i2 = 1
      } else {
        var i1 = 1
        var i2 = 0
      }

      var diff = [p[0]-last[0], p[1]-last[1]]

      // The for below will run `nPixels` times
      var nPixels = Math.abs(diff[i1]);

      // Vector with vec[i1] = 1 or -1:
      var vec = [diff[0]/Math.abs(diff[i1]), diff[1]/Math.abs(diff[i1])]

      // Round the numbers to a pixel position:
      var start_pixel = [Math.round(last[0]), Math.round(last[1])]

      // Draw the pixel lines between each pair of points:
      for(var j=1; j <= nPixels; j++) {
        var pix = [
            Math.round(start_pixel[0]+vec[0]*j),
            Math.round(start_pixel[1]+vec[1]*j)
          ]
        // console.log('new pix:', pix)
        // console.log('start pix:', start_pixel)
        // console.log('vec:', vec)
        pixels.push(pix)
      }

      // Prepare for the next loop:
      last = p
    }

    return pixels
  }
})

//var b = require('./sylvester/sylvester.js')
//console.log('sylvester:',b)

Colide = Body.extend(new function(){
  // Check if moving `p` in the direction of `vec`
  // will colide with line.
  // @args: p - [x,y]
  //        vec - [dx,dy]
  //        line - [[x1,y1],[x2,y2]]
  this.colide = function(p, vec, line) {
    if(!p || !vec || !line)
      return false

    // If any of the objects are not as expected:
    if(typeof p[0] != 'number' || typeof p[1] != 'number' ||
       typeof vec[0] != 'number' || typeof vec[1] != 'number' ||
       typeof line[0] != 'object' || typeof line[1] != 'object' ||
       typeof line[0][0] != 'number' || typeof line[0][1] != 'number' ||
       typeof line[1][0] != 'number' || typeof line[1][1] != 'number')
      return false

    var N = [ p[0]-vec[0][0],p[1]-vec[0][1] ]
    var L = [ vec[0][0]-vec[1][0], vec[0][1]-vec[1][1] ]
  }

  this.init = function(body) {
    if(typeof body == 'object')
      this.Body(body)

    
  }
})


AI = Class.extend({
  init : function(func) {
    if(!this.instanceof(Time))
      this.apply(Time)

    if(!this.instanceof(Space))
      this.apply(Space)

    this.add( func )
  }
})











