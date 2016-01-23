require('../../jstools/Class.js')

var hide = require('../../jstools/tools.js').hide

// Used to record colision data
Colision = Class.extend({
  location : null,
  vector : null,
  normal : null,

  init : function Colision(location, vector, normal) {
    // Local where the two objects touched
    // (referent to the extremity of the object)
    this.location = location

    // Movement vector that describes the path the object did.
    // (referent to the center of the object)
    this.vector = vector

    if(vector)
      hide(this, 'mod', vector.modulus() )

    // The normal unitary vector at the colision point.
    this.normal = normal

    // Set the constructor name:
    this.__proto__.constructor = arguments.callee

    if(location && vector && normal)
      hide(this, 'valid', true)
  },

  _copy : function(col) {
    this.location = col.location
    this.vector = col.vector
    this.normal = col.normal
    hide(this, 'mod', col.mod)
    hide(this, 'valid', col.valid)
  },

  update : function(col) {
      if(!col || !col.vector) return
      if(!this.vector || col.mod < this.mod)
        this._copy(col)
  },

  // If A moved and colided on B
  // This function will return as if B
  // moved and colided on A.
  invert : function() {
    if(!this.valid) return new Colision()

    // if(this.normal)
      var normal = this.normal.x( -1 )
    if(this.vector)
      var vector = this.vector.x( -1 )
    if(this.location)
      var location = this.location.add( vector )
    return new Colision(location, vector, normal)
  }
})

