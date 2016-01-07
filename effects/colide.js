
require('body.js')

// For the math support
require('./colide/sylvester.js')

// Base functions for colision calculations:
var physics = require('./colide/physics.js')

Colide = Body.extend({

  // Used to store vectorized data:
  _colide : {},

  init : function() {
    // Save pos as a vector:
    this._colide.pos = $V([this.X(), this.Y()]).to3D()

    if(this.instanceof(Body.Circle))
      this.apply(Colide.Circle)
    else if(this.instanceof(Body.Polygon))
      this.apply(Colide.Polygon)
    else
      throw "Body should be a circle or a polygon!"
  },

  // A vector
  mov : null,
  Mov : function(mov_vec) {
    mov = mov_vec
    this._colide.mov = $V(mov_vec).to3D()
    this._colide.trajectory = $L(this._colide.pos, this._colide.mov)
  }
})

Colide.Circle = Colide.extend(new function(){

  this.init = function() {}

  /*
   * @name - colide (Colide.Polygon)
   *
   * @desc - Check if this colides with obj when moved by through the vec `mov`.
   *         This function assumes that `this` is an instance of Body.Polygon
   *
   * @params:
   *   - obj: an object that should be instance of the `Colide` class
   *          If it is not, the function returns false.
   *   - mov: a list with 2 numbers representing a vector - [#, #]
   *
   * @return:
   *   - a movement vector if there was a colision
   *     this vector if summed with the current `this` position should 
   *     provide the position of `this` when the colision happend.
   *
   *   - false otherwise
   */
  this.colide = function(obj, mov) {
    if( obj.instanceof(Colide.Circle) )
      return colideOnCircle.call(this, obj, mov)
    if( obj.instanceof(Colide.Polygon) )
      return colideOnPolygon.call(this, obj, mov)

    return false;
  }

  // Private function
  function colideOnCircle(circ, mov) {
    if(!circ.instanceof(Colide.Circle)) return false;

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw "mov should be a tuple: [#, #]"

    var V = $V( mov )
    var M = $L( this._colide.pos, V )

    return physics._colideCircle(this.R(), circ.R(), this._colide.pos, circ._colide.pos, V, M) {
  }

  // Private function
  function colideOnPolygon(pol, mov) {
    if(!pol.instanceof(Colide.Polygon)) return false;

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw "mov should be a tuple: [#, #]"

    var colision = new physics.Colision()

    var P = this._colide.pos
    var r = this.R()
    var V = $V(mov)
    var M = $L(P, V)

    // Colide this circle with each edge of the polygon:
    for(var edge of pol._colide.edges) {
      /* @params: P = center of the circle
       *          r = circle radius
       *          V = mov vec
       *          M = move line
       *          line = [ $V(vertex[0]), $V(vertex[1]) ]
       *          L = @L( [vertex[0], vertex[1] ) */

      var line = edge.points
      var L = edge.line
      colision.update( physics._colideCircleLine(P, r, V, M, line, L) )
    }

    return colision.valid ? colision : false
  }
})

Colide.Polygon = Colide.extend(new function() {

  this.init = function() {
    // Swap the old Body() for the new Body():
    var sBody = this.Body
    this.Body = Body

    // Update the body:
    this.Body(this.body)
    
    function Body(body) {

      // Call the old body:
      sBody.call(this, body)

      this._colide.edges = []
      this._colide.nodes = []

      // Note that the first edge will be
      // between the last and the first vertex.
      last = body[body.length-1]

      // Instantiate each edge:
      for(var i in body) {
        var p0 = $V(last)
        var p1 = $V(body[i])
        this._colide.edges.push({
          'points': [p0, p1],
          'line': $L(p0, p1.subtract(p0))
        })

        last = body[i]
      }
    }
  }

  /*
   * @name - colide (Colide.Circle)
   *
   * @desc - Check if `this` colides with `obj` when moved through the vec `mov`.
   *         This function assumes that `this` is an instance of Body.Circle
   *
   * @params:
   *   - obj: an object that should be instance of the `Colide` class
   *          If it is not, the function returns false.
   *   - mov: a list with 2 numbers representing a vector - [#, #]
   *
   * @return:
   *   - a movement vector if there was a colision
   *     this vector if summed with the current `this` position should 
   *     provide the position of `this` when the colision happend.
   *
   *   - false otherwise
   */
  this.colide = function(obj, mov) {
    if( obj.instanceof(Colide.Polygon) )
      return colideOnPolygon.call(this, obj, mov)
    if( obj.instanceof(Colide.Circle) )
      return colideOnCircle.call(this, obj, mov)

    return false
  }

  // Private function
  function colideOnPolygon(pol, mov) {
    if(!pol.instanceof(Colide.Polygon)) return false;

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw "mov should be a tuple: [#, #]"

    var colision = new physics.Colision()

    var V0 = $V( mov )
    var V1 = V1.x( -1 )

    // For each pair of vertex and edge, and vice-versa,
    // Check if they colide, return the closest colision.
    for( var e1 of this._colide.edges ) {
      for( var e2 of pol._colide.edges ) {
        /* @params: P = point
         *          V = mov vec
         *          M = move line
         *          line = [ $V(vertex[0]), $V(vertex[1]) ]
         *          L = @L( [vertex[0], vertex[1] ) */
        var P = e1.points[0]
        var V = V0
        var M = $L( this._colide.pos, V )
        var line = e2.points
        var L = e2.line

        // Check if this vertex colide with pol edges:
        colision.update( physics._colideLine(P, V, M, line, L) )

        var P = e2.points[0]
        var V = V1
        var M = $L( pol._colide.pos, V )
        var line = e1.points
        var L = e1.line

        // Check if this edges colide with pol vertexes.
        colision.update( physics._colideLine(P, V, M, line, L).invert() )
      }
    }

    // Return closest colision:
    return colision.valid ? colision : false
  }

  // Private function
  function colideOnCircle(circ, mov) {
    if(!circ.instanceof(Colide.Circle)) return false;

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw "mov should be a tuple: [#, #]"

    var colision = new physics.Colision()

    var P = circ._colide.pos
    var r = circ.R()
    var V = $V(mov).x( -1 )
    // V is inverted because _colideCircleLine was made
    // to colide circles on lines, not the opposite
    var M = $L(P, V)

    // Colide each edge of this with the circle
    for(var edge of this._colide.edges) {
      /* @params: P = center of the circle
       *          r = circle radius
       *          V = mov vec
       *          M = move line
       *          line = [ $V(vertex[0]), $V(vertex[1]) ]
       *          L = @L( [vertex[0], vertex[1] ) */

      var line = edge.points
      var L = edge.line
      colision.update( physics._colideCircleLine(P, r, V, M, line, L) )
    }

    return colision.valid ? colision.invert() : false
  }

})


__TESTE__ = true
if(__TESTE__) {

  var pol = new Colide.Polygon()

  console.log()
}












