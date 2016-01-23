/* * * * * STARTING TESTS * * * * */

require('../colide.js')

var should = require('should/as-function')

should.Assertion.add('instanceOf', function(_class) {
 this.params = { operator: 'to be instanceof' }

 should(this.obj).be.instanceof(Class)
 should(this.obj.instanceof(_class)).be.true()
})

var circle;
var line;
var point;

describe('#Colide', function() {
describe('init function', function() {
  it('should build with no errors', function () {
    line = (new Effect())
      .apply(Body, [[0,0], [0,1]])
      .apply(Colide)
    line2 = (new Effect())
      .apply(Colide, [[0,0], [0,1]])

    should(line).be.ok()

    point = new Colide()
    point2 = (new Effect()).apply(Colide)

    should(point).be.ok()

    circle = new Colide(3)
    circle2 = (new Effect()).apply(Body,3).apply(Colide.Circle)

    should(circle).be.ok()
  });

  it('with same parameters they should be equal', function () {

    should(line).be.eql(line2)
    should(point).be.eql(point2)
    should(circle).be.eql(circle2)

  });

  it('should have the `_colide` attribute', function () {
    should(line).have.property('_colide')
    should(point).have.property('_colide')
    should(circle).have.property('_colide')

  });

  it('should be instanceof Colide', function() {
    var L = new Colide([[0,0],[0,1]])
    should(L).be.instanceof(Body)
    should(L).be.instanceOf(Body.Polygon)
    should(L).be.instanceOf(Colide.Polygon)

    var C = new Colide(10)
    should(C).be.instanceof(Body)
    should(C).be.instanceOf(Body.Circle)
    should(C).be.instanceOf(Colide.Circle)

    var P = new Colide()
    should(P).be.instanceof(Body)
    should(P).not.be.instanceOf(Body.Circle)
    should(P).not.be.instanceOf(Body.Polygon)
    should(P).not.be.instanceOf(Colide.Circle)
    should(P).not.be.instanceOf(Colide.Polygon)
  });

  it('should have line.X() and line.Y() working', function() {
    line2.X(2)
    should(line2._colide).have.property('pos').which.eql( $V([2,0,0]) )
    should(line2._colide).have.property('edges_pos').which.is.Array()
    should(line2._colide.edges_pos[0].points[0]).eql( $V([2,1,0]) )
    should(line2._colide.edges_pos[0].points[1]).eql( $V([2,0,0]) )
    should(line2._colide.edges_pos[0].line).eql( $L([2,1,0], [0,-1,0] ) )

    line2.Y(2)
    should(line2._colide.edges_pos[0].points[0]).eql( $V([2,3,0]) )
    should(line2._colide.edges_pos[0].points[1]).eql( $V([2,2,0]) )
    should(line2._colide.edges_pos[0].line).eql( $L([2,3,0], [0,-1,0] ) )
  });

  it('should build `line._colide` as expected', function () {
    should(line._colide).have.property('pos').which.eql( $V([0,0,0]) )
    should(line._colide).have.property('edges').with.lengthOf( 2 )
    should(line._colide).have.property('edges_pos').with.lengthOf( 2 )
    should(line._colide.edges[0]).eql(line._colide.edges_pos[0])
    should(line._colide.edges[1]).eql(line._colide.edges_pos[1])

    should(line._colide.edges[1]).have.property('line').which.is.instanceof( Line )
    should(line._colide.edges[1]).have.property('points').with.lengthOf( 2 )
    should(line._colide.edges[1].points[0]).be.instanceof( Vector )
    should(line._colide.edges[1].points[1]).be.instanceof( Vector )

    line.X(1)
    should(line._colide.edges).not.eql(line._colide.edges_pos)
  });

  it('should build `circle._colide` as expected', function () {
    should(circle._colide).have.property('pos').which.eql( $V([0,0,0]) )
  });

  it('should build `point._colide` as expected', function () {
    should(point._colide).have.property('pos').which.eql( $V([0,0,0]) )
  });
});

describe('colision function', function() {
  it('should colide point on line', function () {
    point = new Colide()
    point.X(1)

    should(point.x).eql(point._colide.pos.e(1))
    should(point.y).eql(point._colide.pos.e(2))

    line = new Colide([[0,0],[0,1]])

    // Colide the point with the line:
    var col = point.colide( line, [-2,0] )

    should( col ).be.ok()
    should( col.location.round() ).eql( $V([0,0,0]) )
    should( col.vector.round() ).eql( $V([-1,0,0]) )
    should( col.normal.round() ).eql( $V([1,0,0]) )

    // Switch the line and point positions:
    point.X(0)
    line.X(1)

    // Colide the point with the line:
    var col = point.colide( line, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )
  });

  it('should colide line on point', function () {
    point = new Colide()
    line = new Colide([[0,0],[0,1]])

    // Reset positions:
    point.X(1)
    line.X(0)
    
    // Colide the line with the point:
    var col = line.colide( point, [2,0] )

    // console.log( col.vector.elements[1] == 0 )
    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // Switch the line and point positions:
    point.X(0)
    line.X(1)

    // Colide the line with the point:
    var col = line.colide( point, [-2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([0,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([-1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([1,0,0]) )

    // process.exit()
  });
  it('should colide line on circle', function () {
    circle = new Colide(2)
    line = new Colide([[0,0],[0,1]])

    // Reset positions:
    circle.X(3)
    line.X(0)
    
    // Colide the line with the circle:
    var col = line.colide( circle, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // Switch the line and circle positions:
    circle.X(0)
    line.X(3)

    // Colide the line with the circle:
    var col = line.colide( circle, [-2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([2,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([-1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([1,0,0]) )

    // process.exit()
  });
  it('should colide circle on line', function () {
    circle = new Colide(2)
    line = new Colide([[0,0],[0,1]])

    // Reset positions:
    circle.X(0)
    line.X(3)

    // Colide the line with the circle:
    var col = circle.colide( line, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([3,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // Switch the line and circle positions:
    circle.X(3)
    line.X(0)

    // Colide the line with the circle:
    var col = circle.colide( line, [-2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([0,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([-1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([1,0,0]) )

    // process.exit()
  });
  it('should colide line on line', function () {
    line = new Colide([[0,0],[0,1]])
    line2 = new Colide([[0,0],[1,0]])

    // Reset positions:
    line.X(0)
    line2.X(1)

    // Colide the lines
    var col = line.colide( line2, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // Change the lines positions
    line.X(0)
    line2.X(1)
    line2.Y(0.5)

    // Colide the lines
    var col = line.colide( line2, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([1,0.5,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // process.exit()
  });
  it('should colide circle on point', function () {
    circle = new Colide(2)
    point = new Colide()

    // Reset positions:
    circle.X(0)
    point.X(3)

    // Colide the circle with the point:
    var col = circle.colide( point, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([3,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // Switch the point and circle positions:
    circle.X(3)
    point.X(0)

    // Colide the circle with the point:
    var col = circle.colide( point, [-2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([0,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([-1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([1,0,0]) )

    // process.exit()
  });
  it('should colide point on circle', function () {
    circle = new Colide(2)
    point = new Colide()

    // Reset positions:
    circle.X(3)
    point.X(0)

    // Colide the circle with the point:
    var col = point.colide( circle, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // Switch the point and circle positions:
    circle.X(0)
    point.X(3)

    // Colide the circle with the point:
    var col = point.colide( circle, [-2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([2,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([-1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([1,0,0]) )

    // process.exit()
  });
  it('should colide circle on circle', function () {
    circle = new Colide(1)
    circle2 = new Colide(1)

    // Reset positions:
    circle.X(0)
    circle2.X(3)

    // Colide the circles
    var col = circle.colide( circle2, [2,0] )

    should( col ).be.ok()
    should( col.location.snapTo(0) ).eql( $V([2,0,0]) )
    should( col.vector.snapTo(0) ).eql( $V([1,0,0]) )
    should( col.normal.snapTo(0) ).eql( $V([-1,0,0]) )

    // process.exit()
  });
  it('should not colide point on point', function () {
    point = new Colide()
    point2 = new Colide()

    // Reset positions:
    point.X(0)
    point2.X(1)

    // Colide the points
    var col = point.colide( point2, [2,0] )

    should( col ).not.be.ok()

    // process.exit()
  });
});
});










