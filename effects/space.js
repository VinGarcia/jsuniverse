
require('./effect.js')
require('../jstools/except.js')

Space = Effect.extend(new function() {
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
      if(x == null) return this.x
      if(typeof x != 'number')
        throw Except("Bad parameter!")
          .msg("this.X expects a number!")

      if(x < 0) x = 0
      if(x > _Space.w-1) x = _Space.w-1

      this.x = x
      return x
    }

    this.Y = function(y) {
      if(y == null) return this.y
      if(typeof y != 'number')
        throw Except("Bad parameter!")
          .msg("this.Y expects a number!")

      if(y < 0) y = 0
      if(y > _Space.h-1) y = _Space.h-1

      this.y = y
      return y
    }
  }
})
