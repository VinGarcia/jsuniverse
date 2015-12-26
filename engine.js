
tools = require('./jstools/tools.js')
Universe = require('./universe.js').Universe

// Build the Universe:
Game = require('./game.js').Game

var person = new Class()
Universe.new (
  person
    .apply(Alive, 10, 1)
    // .apply(Space, 2, 3)
    .apply(Space, 4, 4)
    .apply(Body, 3)
    // .apply(Body, [[1.5,1.5],[1.5,-1.5],[-1.5,-1.5], [-1.5,1.5]])
    // .apply(Body, [[1,1],[1,-2],[-2,1], [-2,-2]])
    .apply(AI, F2())
)

//console.log(person.pixels)

//console.log(person)

person.hp = 1
Universe.add( Universe.Draw )
Universe.add( function() { console.log('HP:',person.hp) } )
Universe.add( function() { console.log('pos:',person.X(), person.Y()) } )

//var a = (new Class).apply(Colide)
// console.log('colide?', a.colideLine([1,1], [1,1], [[2,2], [3,2]])) // answer: [1, 1 ,0]
// console.log('colide?', a.colideCircle([1,1], 1, [0,0], [2,2])) // answer: false
// console.log('colide?', a.colideCircle([1,1], 1, [-2,-2], [0,0])) // answer: [-0.29, -0.29, 0]
//console.log('colide?', a.colideWith()

Universe.start()


function F() {
  var counter = 0;
  return function() {
    if(counter%2==0) {
      // Escreve x+1:
      var x = this.X()
      this.X(x+1)
    } else {
      var y = this.Y()
      this.Y(y+1)
    }
    counter++
  }
}

function F2() {
  var counter = 0;
  return function() {
    var num = counter%10
    var x = this.X()
    var y = this.Y()
    if(num==0)
      this.Y(y-1)
    else if(num > 0 && num < 5)
      this.X(x+1)
    else if(num == 5)
      this.Y(y+1)
    else if(num > 5)
      this.X(x-1)
    counter++
  }
}









