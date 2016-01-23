
require('../universe.js')
require('./body.js')

// For the math support
require('./colide/sylvester.js')

// Base functions for colision calculations:
var physics = require('./colide/physics.js')
var Except = require('../jstools/except.js').Except

Colide = Body.extend(new function(){

  // Used to store vectorized data:
  this._colide = {}

  this.init = function(body) {
    this.super(body)

    // Save pos as a vector:
    this._colide.pos = $V([this.X(), this.Y()]).to3D()

    if(this.instanceof(Body.Circle))
      this.apply(Colide.Circle)
    else if(this.instanceof(Body.Polygon))
      this.apply(Colide.Polygon)

    this.overwrite('X', function(x) {
      var ret = this.super(x)
      this._colide.pos.elements[0] = ret
      return ret
    });

    this.overwrite('Y', function(y) {
      var ret = this.super(y)
      this._colide.pos.elements[1] = ret
      return ret
    });
  }

  // A vector
  this.mov = null;
  this.Mov = function(mov_vec) {
    mov = mov_vec
    this._colide.mov = $V(mov_vec).to3D()
    this._colide.trajectory = $L(this._colide.pos, this._colide.mov)
  }

  /* @name - colide (Point)
   */
  this.colide = function(obj, mov) {
    if(!obj)
      throw Except('Argument undefined!')
        .msg('Param `obj` must be Defined!')

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw Except("Invalid argument!")
        .msg("mov should be a tuple: [#, #]")

    if( obj.instanceof(Colide.Polygon) )
      return colideOnPolygon.call(this, obj, mov)
    if( obj.instanceof(Colide.Circle) )
      return colideOnCircle.call(this, obj, mov)
    if( obj.instanceof(Colide) )
      return colideOnCircle.call(this, obj, mov, true)

    return false;
  }

  // Private function
  function colideOnCircle(circ, mov, noRadius) {
    var V = $V( mov ).to3D()
    var M = $L( this._colide.pos, V )
    return physics._colideCircle(0, noRadius ? 0 : circ.R(), this._colide.pos, circ._colide.pos, V, M)
  }

  // Private function
  function colideOnPolygon(pol, mov) {
    var colision = new physics.Colision()

    var P = this._colide.pos
    var r = 0
    var V = $V(mov)
    var M = $L(P, V)

    // Colide this circle with each edge of the polygon:
    for(var edge of pol._colide.edges_pos) {
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

Colide.Circle = Colide.extend(new function(){

  this.init = function() {}

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
   *   - An instance of physics.Colision describing the colision.
   *
   *   - false otherwise
   */
  this.colide = function(obj, mov) {
    if(!obj)
      throw "Object must not be undefined!"

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw "mov should be a tuple: [#, #]"

    if( obj.instanceof(Colide.Circle) )
      return colideOnCircle.call(this, obj, mov)
    if( obj.instanceof(Colide.Polygon) )
      return colideOnPolygon.call(this, obj, mov)
    if( obj.instanceof(Colide))
      return colideOnCircle.call(this, obj, mov, true)

    return false;
  }

  // Private function
  function colideOnCircle(circ, mov, noRadius) {
    var V = $V( mov ).to3D()
    var M = $L( this._colide.pos, V )

    return physics._colideCircle(this.R(), noRadius ? 0 : circ.R(), this._colide.pos, circ._colide.pos, V, M)
  }

  // Private function
  function colideOnPolygon(pol, mov) {
    var colision = new physics.Colision()

    var P = this._colide.pos
    var r = this.R()
    var V = $V(mov).to3D()
    var M = $L(P, V)

    // Colide this circle with each edge of the polygon:
    for(var edge of pol._colide.edges_pos) {
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

  this.init = function(TESTE) {

    this.overwrite('Body', Body);

    this.Body(this.body)

    function Body(body) {

      // Call the old body:
      var ret = this.super(body)

      if(arguments.length == 0) return ret;

      this._colide.edges = []
      this._colide.edges_pos = []

      // Note that the first edge will be
      // between the last and the first vertex.
      last = body[body.length-1]

      // Instantiate each edge:
      for(var i in body) {
        var p0 = $V(last).to3D()
        var p1 = $V(body[i]).to3D()
        this._colide.edges.push({
          'points': [p0, p1],
          'line': $L(p0, p1.subtract(p0))
        })

        var pos = this._colide.pos
        this._colide.edges_pos.push({
          'points': [p0.add(pos), p1.add(pos)],
          'line': $L(p0.add(pos), p1.subtract(p0))
        })
        edge = this._colide.edges_pos
        edge = edge[edge.length-1]

        last = body[i]
      }

      return ret;
    }

    this.overwrite('X', function(x) {
      var ret = this.super(x)
      for(var i in this._colide.edges) {
        var points = this._colide.edges[i].points
        this._colide.edges_pos[i].points[0].elements[0] = points[0].elements[0] + ret;
        this._colide.edges_pos[i].points[1].elements[0] = points[1].elements[0] + ret;

        var line = this._colide.edges[i].line
        this._colide.edges_pos[i].line.anchor.elements[0] = line.anchor.elements[0] + ret;
      }

      return ret
    });

    this.overwrite('Y', function(y) {
      var ret = this.super(y)
      for(var i in this._colide.edges) {
        var points = this._colide.edges[i].points
        this._colide.edges_pos[i].points[0].elements[1] = points[0].elements[1] + ret;
        this._colide.edges_pos[i].points[1].elements[1] = points[1].elements[1] + ret;

        var line = this._colide.edges[i].line
        this._colide.edges_pos[i].line.anchor.elements[1] = line.anchor.elements[1] + ret;
      }
      
      return ret
    });
  }

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
   *   - An instance of physics.Colision describing the colision
   *
   *   - false otherwise
   */
  this.colide = function(obj, mov) {
    if(!obj)
      throw "Object must not be undefined!"

    if(!mov instanceof Array ||
        mov.length < 2 ||
        typeof mov[0] != 'number' ||
        typeof mov[1] != 'number'
      )
      throw "mov should be a tuple: [#, #]"

    if( obj.instanceof(Colide.Polygon) )
      return colideOnPolygon.call(this, obj, mov)
    if( obj.instanceof(Colide.Circle) )
      return colideOnCircle.call(this, obj, mov)
    if( obj.instanceof(Colide) )
      return colideOnCircle.call(this, obj, mov, true)

    return false
  }

  // Private function
  function colideOnPolygon(pol, mov) {
    var colision = new physics.Colision()

    var V0 = $V( mov ).to3D()
    var V1 = V0.x(-1)

    // For each pair of vertex and edge, and vice-versa,
    // Check if they colide, return the closest colision.
    for( var e1 of this._colide.edges_pos ) {
      for( var e2 of pol._colide.edges_pos ) {
        /* @params: P = point
         *          V = mov vec
         *          M = move line
         *          line = [ $V(vertex[0]), $V(vertex[1]) ]
         *          L = @L( [vertex[0], vertex[1] ) */
        var P = e1.points[0]
        var V = V0
        var M = $L( P, V )
        var line = e2.points
        var L = e2.line

        // Note: P = e1.points[1] is not tested because it is the same
        // as `points[0]` of the next edge, so it'd be redundant do to so.

        // Check if this vertex colide with pol edges:
        colision.update( physics._colideLine(P, V, M, line, L) )

        var P = e2.points[0]
        var V = V1
        var M = $L( P, V )
        var line = e1.points
        var L = e1.line

        // Check if this edges colide with pol vertexes.
        var col = physics._colideLine(P, V, M, line, L)
        colision.update( col ? col.invert() : null )
      }
    }

    // Return closest colision:
    return colision.valid ? colision : false
  }

  // Private function
  function colideOnCircle(circ, mov, noRadius) {
    var colision = new physics.Colision()

    var P = circ._colide.pos
    var r = noRadius ? 0 : circ.R()
    var V = $V(mov).to3D().x( -1 )
    // V is inverted because _colideCircleLine was made
    // to colide circles on lines, not the opposite
    var M = $L(P, V)

    // Colide each edge of this with the circle
    for(var edge of this._colide.edges_pos) {
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

