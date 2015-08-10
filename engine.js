
tools = require('./jstools/tools.js')
Universe = require('./universe.js').Universe

// Build the Universe:
Game = require('./game.js').Game

var person = new Class()
Universe.new (
  person
    .apply(Alive, 10, 1)
    .apply(Space, 1, 2)
    .apply(Dance)
  )

//console.log(person)

person.hp = 1
Universe.add( Universe.Draw )
Universe.add( function() { console.log('HP:',person.hp) } )
Universe.add( function() { console.log('pos:',person.X(), person.Y()) } )

// Start the time engine:
function update(){ Universe.update() }
setInterval(update, 500)



