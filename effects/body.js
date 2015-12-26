
require('./space.js')

/*
 * @name - Body
 */
Body = Space.extend(new function() {
  this.Draw = function() {
    return { '#' : this.pixels }
  }

  // Must return a list of pixels ([x,y] values)
  this.generatePixels = function() { return [[0,0]] }

  // body can be of two types:
  //   - A list of vertexes (for polygonal bodies)
  //   - A radius (for circular bodies)
  //
  // If body is a list of vertexes it must come in the following format:
  // e.g.: body = [[x1,y1], [x2,y2], [x3,y3], ...]
  // Note: x#,y# coordinates are relative to the center of the object.
  //       thus negative values are allowed.
  this.init = function(body) {
    if(!body) this.pixels = this.generatePixels()

    if(typeof body == 'number') Body.Circle.call(this, body)
    else Body.Polygon.call(this, body)
  }
})

/*
 * @name - Body Circle
 */
Body.Circle = Body.extend({
  init : function(radius) {
    if(!radius || radius < 0) radius = 0
    var _r = radius
    var _pixels = this.generatePixels(_r)
    this.pixels = _pixels.copy()

    // Declare getters and setters:
    this.Pixels = function() { return this.pixels }
    this.R = function(r) {
      if(radius && radius >= 0) {
        _r = radius;
        _pixels = this.generatePixels(_r)
        // Update pixels public instance:
        this.pixels = _pixels.copy()
      } else return _r;
    }
  },

  generatePixels : function(r) {
    var top = Math.round(r)
    var pixels = [[0,top], [0,-top], [top,0], [-top,0]]

    // Draw the circle:
    for(var aux=top-1; aux > -top; aux--) {
      var dist = Math.round(Math.sqrt(r*r - aux*aux))

      // Draw from top to bottom:
      pixels.push([ dist, aux])
      pixels.push([-dist, aux])

      // Draw from left to right:
      pixels.push([aux, dist])
      pixels.push([aux,-dist])
    }

    return pixels
  }
  
})

/*
 * @name - Body Polygon
 */
Body.Polygon = Body.extend({
  init : function(body) {
    // Two lists of points (x,y) in space:
    // The center of the body is set at (0,0)
    // Negative points are allowed
    var _body, _pixels

    // Check if body is in a valid format:
    _body = body_check(body)
    this.body = _body.copy()

    // Generate the pixel representation of the object:
    var _pixels = this.generatePixels(_body)
    this.pixels = _pixels.copy()

    // Declare getters and setters:
    this.Pixels = function() { return this.pixels }
    this.Body = function(body) {
      if(arguments.length == 0)
        return this.body

      _body = body_check(body)
      _pixels = this.generatePixels(_body)

      // Update public instances:
      this.body = _body.copy()
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
  },

  generatePixels : function(body) {
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
        pixels.push(pix)
      }

      // Prepare for the next loop:
      last = p
    }

    return pixels
  }
})
