// For the math support
require('./sylvester.js')
require('./colision.js')

/*
 * @functions on this file:
 * 
 * Note: The asterisk indicates dependency (top-down),
 *
 *   - colideCircleLine (circle on line)
 *     * _colideCircle
 *     * _colideLine
 *
 *   - colideLine (point on line)
 *
 *   - colideCircle (circle on circle)
 * 
 */

/* * * * * Exporting functions: * * * * */

exports.colideCircleLine = colideCircleLine;
exports._colideCircleLine = _colideCircleLine;

exports.colideLine = colideLine;
exports._colideLine = _colideLine;

exports.colideCircle = colideCircle;
exports._colideCircle = _colideCircle;

// Auxiliar Class used to store colision data:
exports.Colision = Colision

/* * * * * START FUNCTION DECLARATIONS: * * * * */

/*
 * @name - colideCircleLine
 * 
 * @desc - check if the circle with center on `p` and radius `r`
 *         colides with the line segment described by `line`
 * 
 * @params:
 *   - p: the center of the circle
 *        it is given by a tuple of numbers, e.g.: [#, #]
 *
 *   - mov: a tuple numbers, e.g.: [#, #]
 *          representing the movement vector of the circle
 *          in relation to the line segment.
 *    
 *   - line: a pair of tuples of numbers, e.g.: [[#, #], [#, #]]
 *           represeting the start and end of a line segment.
 *
 *   - r: the radius of the circle with center on `p`.
 *
 * @return:
 *   - A movement vector if there was a colision
 *     this vector if summed with the current position of the circle
 *     should provide its position at the moment of the colision.
 *
 *   - false otherwise
 */
function colideCircleLine(p, r, mov, line) {
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

  return _colideCircleLine(P, r, V, M, _line, L)
}

/* @params: P = center of the circle
 *          r = circle radius
 *          V = mov vec
 *          M = move line
 *          line = [ $V(vertex[0]), $V(vertex[1]) ]
 *          L = @L( [vertex[0], vertex[1] ) */
function _colideCircleLine(P, r, V, M, line, L) {

  if(r < 0) return false

  // * * * * * Check for colisions: * * * * *

  var colision = new Colision()
  var colMod;

  if(r > 0) {
    // If P is really close to the line:
    if(L.distanceFrom(P) < r) {
      var p_close = L.pointClosestTo(P)
      var line0 = p_close.subtract(line[0])
      var line1 = p_close.subtract(line[1])

      // If p_close between line[0] and line[1]:
      if(line0.isAntiparallelTo(line1) /*(redundant:) || line0.eql(p_close) || line1.eql(p_close) */ ) {
        var normal = P.subtract(p_close).toUnitVector()
        return new Colision(p_close, $V([0,0,0]), normal)
      }
    }

    // Does P colide with line[0] or line[1]?
    colision.update( _colideCircle(r, 0, P, line[0], V, M) )
    colision.update( _colideCircle(r, 0, P, line[1], V, M) )
  }

  var border = P
  if(r > 0) {
    var normal = P.subtract(L.pointClosestTo(P)).toUnitVector()

    // Move P across normal until
    // it hits the border of the circle:
    border = P.add( normal.x(-r) )
  }

  colision.update( _colideLine(border, V, M, line, L) )

  // Return the colision point:
  return colision.valid ? colision : false
}

/*
 * @name - colideLine
 * 
 * @desc - check if the point `p` moving through the vector `mov`
 *         colides with the line segment described by `line`
 * 
 * @params:
 *   - p: the location of the point
 *        it is given by a tuple of numbers, e.g.: [#, #]
 *
 *   - mov: a tuple numbers, e.g.: [#, #]
 *          representing the movement vector of the point
 *          in relation to the line segment.
 *    
 *   - line: a pair of tuples of numbers, e.g.: [[#, #], [#, #]]
 *           represeting the start and end of a line segment.
 *
 * @return:
 *   - A movement vector if there was a colision
 *     this vector if summed with the current position of the point
 *     should provide its position at the moment of the colision.
 *
 *   - false otherwise
 */
function colideLine(p, mov, line) {

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

  return _colideLine(P, V, M, _line, L)
}

/* @params: P = point
 *          V = mov vec
 *          M = move line
 *          line = [ $V(vertex[0]), $V(vertex[1]) ]
 *          L = @L( [vertex[0], vertex[1] ) */
function _colideLine(P, V, M, line, L) {

  var colision = L.intersectionWith(M)

  // * * * * * Colision on the move: * * * * *

  // If the lines are parallel:
  if(colision == null) return false

  // Distance vector between P and the colision point:
  var colDistance = colision.subtract(P)

  // Check if the point is moving away from the line:
  if(colDistance.isAntiparallelTo(V)) return false

  // Check if the distance between P and colission is < |V|:
  if(V.modulus() < colDistance.modulus()) return false

  // Check if the colision point is between line[0] and line[1]
  var line0vec = colision.subtract(line[0])
  var line1vec = colision.subtract(line[1])
  if(line0vec.isParallelTo(line1vec)) return false

  // Calculate the normal vector:
  var normal = P.subtract(L.pointClosestTo(P)).toUnitVector()

  // Colide!
  return new Colision(colision, colDistance, normal)
}

/*
 * @name - colideCircle
 *
 * @desc - Calculates if a circle with center on `center` 
 *         and radius `radius` will colide with the `point`
 *         by moving through the movement vector `mov`.
 *
 * @params:
 *   - center: an instance of Vector
 *             describes the center of the circle.
 *
 *   - radius: a number describing the radius of the circle.
 *
 *   - point: an instance of Vector
 *            describes the location of the point.
 *
 *   - mov: an instance of Vector
 *          describes the movement vector of the circle
 *          in relation to the `point`
 *
 * @return:
 *   - A movement vector if there was a colision
 *     this vector if summed with the current position of the circle
 *     should provide its position at the moment of the colision.
 *
 *   - false otherwise
 */
function colideCircle(center1, radius1, mov, center2, radius2) {

  // Optional:
  radius2 = radius2 || 0

  // Check for errors:
  try {
    if(typeof center1[0] != 'number' ||
       typeof center1[1] != 'number' ||
       typeof radius1 != 'number' ||
       typeof radius2 != 'number' ||
       typeof mov[0] != 'number' ||
       typeof mov[1] != 'number' ||
       typeof center2[0] != 'number' ||
       typeof center2[1] != 'number') return false
  } catch(err) { return false }

  // Build the variables:
  try {
    var P1 = $V(center1).to3D()
    var P2 = $V(center2).to3D()
    var V = $V(mov).to3D()
    var M = $L(P1, V)
  } catch(err) { return false }

  return _colideCircle(radius1, radius2, P1, P2, V, M)
}

// Tested
function _colideCircle(r1, r2, P1, P2, V, M) {

  var r = r1+r2

  // If it has already colided:
  if(P1.distanceFrom(P2) < r) {
    var normal = P1.subtract(P2).toUnitVector()
    return new Colision(P2, $V([0,0,0]), normal)
  }

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

  // On the moment of the colision, we have a rectangle triangle:
  // Consider P1' the location of P1 at the colision.
  //   |1° edge (P1',P2)| == r
  //   |2° edge (p_close,P2)| == r
  //   |3° edge (P1',p_close) == ?
  //
  // To find the last edge (P1', p_close) length:
  var last = Math.sqrt(r*r - dist*dist)

  // Set the colision point relative to p_close
  // moving back |last| units of movement:
  var colisionPos = p_close.add( Vu.x(-last) )
  var colisionVec = colisionPos.subtract(P1)

  // If the colision point is too far away from P1:
  if(colisionVec.modulus() > V.modulus()) return false

  // Calculate the normal vector:
  var normal = colisionPos.subtract(P2).toUnitVector()
  var colisionPoint = P2.add( normal.x( r2 ) )

  // If it really colides:
  return new Colision(colisionPoint, colisionVec, normal)
}

/* * * * * The test suit lay below * * * * */

function TESTE() {

  // OK
  // console.log('colideCircle:')
  //           colideCircle(center2, radius1,    mov, center2, radius2) 
  // console.log( colideCircle(  [3,0],       1, [-2,0],   [0,0], 1) )

  // OK
  // console.log('colideLine:')
  //           colideLine(     p,    mov, line )
  // console.log( colideLine( [3,0], [-3,0], [ [0,0],[0,1] ]) )
  // console.log( colideLine( [3,0], [-3,0], [ [0,0],[0,1] ], true) )

  // OK
  // console.log('colideCircleLine:')
  //           colideCircleLine(    p, r,    mov, line)
  // console.log( colideCircleLine([3,0], 1, [-5,0], [ [0,0],[0,1] ]) )
  // console.log( colideCircleLine([3,0], 5, [-5,0], [ [0,0],[0,1] ]) )
  // console.log( colideCircleLine([3,0], 5, [-5,0], [ [0,0.5],[0,1] ]) )
  // console.log( colideCircleLine([3,0], 1, [-5,0], [ [0,0.5],[0,1] ]) )

  // require('../colide.js')
  // console.log('pointsOnPolygon:')
  //           pointsOnPolygon(points, body, mov)
  // console.log( pointsOnPolygon([[0,0],[0,1],[0,-1]], , mov) )
}

// Tests:
// var __TESTE__ = 'physics'
if(__TESTE__ ='physics') { TESTE() }

