require('./body.js')
require('../sylvester.js')

Colide = Body.extend(new function(){

  function circleColideWith(mov, obj) {

    if(!obj.instanceof(Colide)) return false

    if(obj.instanceof(Body.Circle)) {
      var center = [this.X(), this.Y()]
      var this_r = this.R ? this.R() : 0
      var p = [obj.X(), obj.Y()]
      var r = this_r + obj.R()

      return this.colideCircle(center, r, mov, p)

    } else {
      if(obj.instanceof(Body.Polygon))
        return colidePolygonCircle(this, pol, mov)
    }
  }

  function polygonColideWith(mov, obj) {
    var body = this.Body()

    if(!obj.instanceof(Colide)) return false

    if(obj.instanceof(Body.Circle)) {

      // Invert mov[i] vector:
      var aux = []
      for(var i in mov)
        aux[i] = -mov[i]

      var colision = colidePolygonCircle(obj, this, aux)

      // Invert the vector back:
      colision.x(-1)

      return colision

    } else if(obj.instanceof(Body.Polygon)) {
      
      var this_body = this.Body()
      var obj_body = obj.Body()
      var colision = false, colMod

      // Calculate the colision of these points on those edges:
      updateColision( pointsOnPolygon(this_body, obj_body, mov) )

      var aux = []
      for(var i in mov)
        aux[i] = -mov[i]

      // Calculate the colision of these edges on those points:
      var colTemp = pointsOnPolygon(obj_body, this_body, aux)

      // Invert the colision to the right direction:
      colTemp.x(-1)

      updateColision(colTemp)

      return colision

      // Update colision and colMod:
      function updateColision(col) {
        if(!col) return
        var mod = col.modulus()
        if(mod < colMod || !colision) {
          colision = col
          colMod = mod
        }
      }
    }
  }

  // Calculate the colision of each point on points
  // with the edges of the a polygon.
  function pointsOnPolygon(points, body, mov) {
    var colision=false, colMod

    // For each vertex of this:
    for(var v in points) {
      var vertex = points[v]
      var last=body[0], next

      // For each edge of obj:
      for(var i=1; i < body.length; i++) {
        next = body[i]

        var line = [last, next]
        updateColision( colideLine(vertex, mov, line) )

        // Update last value:
        last = next
      }

      updateColision( colideLine(vertex, mov, [last, body[0]]) )
    }

    return colision;

    // Update colision and colMod:
    function updateColision(col) {
      if(!col) return
      var mod = col.modulus()
      if(mod < colMod || !colision) {
        colision = col
        colMod = mod
      }
    }
  }

  // This code assume circ is moving and pol is not.
  function colidePolygonCircle(circ, pol, mov) {
    if(!pol.instanceof(Body.Polygon) || !circ.instanceof(Body.Circle))
      throw "bad arguments!"

    var r = circ.R()
    var center = [circ.X(), circ.Y()]
    var body = pol.Body()
    var last = body[0], next

    var colision=false, colMod

    // For each edge of the polygon:
    for(var i=1; i < body.length; i++) {
      // Read new next:
      next = body[i]

      var line = [last, next]
      // Save only the closest colision:
      updateColision( colideCircleLine(center, mov, line, r) )

      // Update last:
      last = next
    }

    // Now check the last edge:
    updateColision( colideCircleLine(center, mov, [last, body[0]], this_r) )

    return colision
    
    // Update colision and colMod:
    function updateColision(col) {
      if(!col) return
      var mod = col.modulus()
      if(mod < colMod || !colision) {
        colision = col
        colMod = mod
      }
    }
  }

  this.init = function(body) {
    // Initialize this class:
    if(body) this.super(body)

    if(this.instanceof(Body.Circle))
      this.colideWith = circleColideWith
    if(this.instanceof(Body.Polygon))
      this.colideWith = polygonColideWith
  }

  this.colidePolygon = function(pol1, pol2, mov) {
    // With only two args set pol1 = this
    if(arguments.lentgh==2) {
      mov = pol2
      pol2 = pol1
      pol1 = this
    }

    try {
      // Check for error  s:
      if(
         typeof pol1.body != 'object' ||
         typeof pol2.body != 'object' ||
         typeof mov[0] != 'number' ||
         typeof mov[1] != 'number' ||
         typeof line[0][0] != 'number' ||
         typeof line[0][1] != 'number' ||
         typeof line[1][0] != 'number' ||
         typeof line[1][1] != 'number'
        ) return false

      // Build the variables:
      var P = $V(p).to3D()
      var V = $V(mov).to3D()

      var _line = [];
      _line[0] = $V(line[0]).to3D()
      _line[1] = $V(line[1]).to3D()

      var L = $L(_line[0], _line[1].subtract(_line[0]))
      var M = $L(P, P.add(V))
    } catch(err) { return false }

    return _colidePolygon(pol1, pol2, mov)
  }

  function _colidePolygon(pol1, pol2, mov) {

    // For each node on pol1
    // Check colision with edges on pol2:
    for(var node in pol1.body) {
      var edge0 = pol2.body[0]
      for(var i=1; i < pol2.body.length; i++) {
        edge1 = pol2.body[i]
        _colideLine(P, V, line, L, M)
      }
    }
  }

  this.colideCircleLine = function(p, mov, line, r) {
    try {
      // Check for errors:
      if(
         typeof p[0] != 'number' ||
         typeof p[1] != 'number' ||
         typeof mov[0] != 'number' ||
         typeof mov[1] != 'number' ||
         typeof line[0][0] != 'number' ||
         typeof line[0][1] != 'number' ||
         typeof line[1][0] != 'number' ||
         typeof line[1][1] != 'number'
        ) return false

      // Build the variables:
      var P = $V(p).to3D()
      var V = $V(mov).to3D()

      var _line = [];
      _line[0] = $V(line[0]).to3D()
      _line[1] = $V(line[1]).to3D()

      var L = $L(_line[0], _line[1].subtract(_line[0]))
      var M = $L(P, P.add(V))
    } catch(err) { return false }

    // The radius of the pariticle `p`
    if(!r) r = 0

    return _colideCircleLine(P, V, L, _line, M, r)
  }

  function _colideCircleLine(P, V, L, line, M, r) {

    if(r < 0) return false

    // * * * * * Check for colisions: * * * * *

    var colision = false;
    var colMod;

    if(r > 0) {
      // If P is really close to the line:
      if(L.distanceFrom(P) < r) {
        var proj = L.pointClosestTo(P)
        var line0 = proj.subtract(line[0])
        var line1 = proj.subtract(line[1])

        // If proj between line[0] and line[1]:
        if(line0.isAntiparallelTo(line1))
          colision = $V[0,0,0]
          colMod = 0
      }

      // Does P colide with line[0] or line[1]?
      minCol( _colideCircle(r, P, line[0], V, M) )
      minCol( _colideCircle(r, P, line[1], V, M) )
    }

    if(r > 0) {
      // Get ortogonal unit vector pointing from P to L:
      var lNormal = L.pointClosestTo(P).subtract(P).toUnitVector()

      // Move P across lNormal until
      // it hits the border of the circle:
      P = P.add( lNormal.x(r) )
    }

    minCol( _colideLine(P, V, line, L, M) )

    // Else return the colision point:
    return colision

    /* * * * * get minimal distance colision: * * * * */

    // Update colision and colMod:
    function minCol(col) {
      if(!col) return
      var mod = col.modulus()
      if(mod < colMod || !colision) {
        colision = col
        colMod = mod
      }
    }
  }

  /* Check if moving `p` in the direction of `vec`
   * will colide with the Line `line`.
   * @args: p - [x,y]
   *        vec - [dx,dy]
   *        line - [[x1,y1],[x2,y2]]
   *
   * @returns: The movement vector that moves p
   *           to the colision location.
   */
  this.colideLine = function(p, mov, line) {

    // Check for errors:
    try {
      if(typeof p[0] != 'number' ||
         typeof p[1] != 'number' ||
         typeof mov[0] != 'number' ||
         typeof mov[1] != 'number' ||
         typeof line[0][0] != 'number' ||
         typeof line[0][1] != 'number' ||
         typeof line[1][0] != 'number' ||
         typeof line[1][1] != 'number')
        return false
    } catch(err) { return false }

    // Build the variables:
    try {
      var P = $V(p).to3D()
      var V = $V(mov).to3D()
      var _line = []
      _line[0] = $V(line[0]).to3D()
      _line[1] = $V(line[1]).to3D()
      var L = $L(_line[0],_line[1].subtract(_line[0]))
      var M = $L(P, V)
    } catch(err) { return false }

    return _colideLine(P, V, _line, L, M)
  }

  function _colideLine(P, V, line, L, M) {

    var colision = L.intersectionWith(M)

    // * * * * * Colision on the move: * * * * *

    // If the lines are parallel:
    if(colision == null) {
      // console.log('parallel!')
      return false
    }

    // Distance vector between P and the colision point:
    var colDistance = colision.subtract(P)

    // Check if the point is moving away from the line:
    if(colDistance.isAntiparallelTo(V)) {
      //console.log("Wrong direction")
      return false
    }

    // Check if the distance between P and colission is < |V|:
    if(V.modulus() < colDistance.modulus()) {
      //console.log("Too far")
      return false
    }

    // Check if the colision point is between line[0] and line[1]
    var line0vec = colision.subtract(line[0])
    var line1vec = colision.subtract(line[1])
    if(line0vec.isParallelTo(line1vec)) {
      //console.log("Did not hit the line!")
      return false
    }

    // Colide!
    return colDistance
  }

  /*
   * @name: colideCircle
   *
   * @desc: Calculates if a circle with center on `P1` will
   *        colide with the point `P2` with movement `V`
   *
   * @args: P1, P2 and V are instanceof Vector with 3 dimensions
   *        M is a Line with base on P1 and direction V.
   *        r is a number.
   *
   * @returns: The movement vector of the center of the circle
   *           to the point where the colision happens or false.
   */
  this.colideCircle = function(center, radius, mov, point) {
    // Check for errors:
    try {
      if(typeof center[0] != 'number' ||
         typeof center[1] != 'number' ||
         typeof radius != 'number' ||
         typeof mov[0] != 'number' ||
         typeof mov[1] != 'number' ||
         typeof point[0] != 'number' ||
         typeof point[1] != 'number') return false
    } catch(err) { return false }

    // Build the variables:
    try {
      var P1 = $V(center).to3D()
      var P2 = $V(point).to3D()
      var V = $V(mov).to3D()
      var M = $L(P1, V)
    } catch(err) { return false }

    return _colideCircle(radius, P1, P2, V, M)
  }

  function _colideCircle(r, P1, P2, V, M) {
    // If it has already colided:
    if(P1.distanceFrom(P2) < r) return $V([0,0,0])

    // If it won't move:
    if(V.eql($V([0,0,0]))) return false

    var p_close = M.pointClosestTo(P2)
    var dist = p_close.distanceFrom(P2)
    var Vu = V.toUnitVector()

    // * * Before considering the movement: * *

    // If it is too distant:
    if(dist >= r) return false

    // If it is moving away from p_close:
    if(V.isAntiparallelTo(p_close.subtract(P1))) return false

    // * * After it starts moving: * *

    // On the moment of the hit on colision location(=P1'):
    //   |edge (P1',P2)| == r
    //   |edge (p_close,P2)| == r
    // To find the last edge (P1', p_close) length:
    var last = Math.sqrt(r*r - dist*dist)

    // Set the colision point relative to p_close
    // moving back |last| units of movement:
    var colision = p_close.add( Vu.x(-last) )
    var colisionVec = colision.subtract(P1)

    // If the colision point is too far away from P1:
    if(colisionVec.modulus() > V.modulus()) return false

    // If it really colides:
    return colisionVec
  }

})
