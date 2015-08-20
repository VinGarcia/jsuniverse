
tools = require('./jstools/tools.js')
Universe = require('./universe.js').Universe

// Build the Universe:
Game = require('./game.js').Game

var person = new Class()
Universe.new (
  person
    .apply(Alive, 10, 1)
    .apply(Space, 1, 2)
    // Todo: accept non integers points
    //       make the inside area of the polygon to be filled with pixels
    .apply(Body, [[1.5,1.5],[1.5,-1.5],[-1.5,-1.5], [-1.5,1.5]])
    // .apply(Body, [[1,1],[1,-2],[-2,1], [-2,-2]])
    .apply(AI, F())
)

console.log(person.pixels)

//console.log(person)

person.hp = 1
Universe.add( Universe.Draw )
Universe.add( function() { console.log('HP:',person.hp) } )
Universe.add( function() { console.log('pos:',person.X(), person.Y()) } )

Universe.start()


var count = 0
function F() {
  var counter = 0;
  return function() {
    if(count%2==0) {
      // Escreve x+1:
      var x = this.X()
      this.X(x+1)
    } else {
      var y = this.Y()
      this.Y(y+1)
    }
    count++
  }
}

