
// Effects available on this game:

// Objects are updated at each clock
require('./effects/time.js')

// Objects may have position in space
require('./effects/space.js')

// Objects may have HP, HP regen and might die.
require('./effects/alive.js')

// Objects may have a body composed by a
// single point/circle of by several points/circles
require('./effects/body.js')

// Objects might colide with each other
// ** Not yet working
//require('./effects/colide.js')

// Objects might perform custom actions at each clock
require('./effects/ai.js')











