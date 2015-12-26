require('./effect.js')

Time = Effect.extend(new function() {
   /*
  // * The definitions below are hard
  // * coded on the Universe for readability.
  Universe.triggers = []
  Universe.add = function(trigger) {
    this.triggers.push(trigger)
    return this
  }
  Universe.update = function() {
    for(var i in this.triggers)
      this.triggers[i].apply(this)
  }
  Universe.start = function() {
    function update(){ Universe.update() }
    setInterval(update, 500)
  }
  // */

  // Add a trigger to update all Time objects.
  Universe.add(function() {
    var objs = this.objs
    for(var i in objs) {
      if(objs[i].instanceof(Time))
        objs[i].update()
    }
  })

  this.triggers = []
  this.add = function(trig) { this.triggers.push(trig) }
  this.update = function() {
    for(var i in this.triggers) {
      if(typeof this.triggers[i] !== 'function')
        console.log('Triggers:', this.triggers)
      else
      this.triggers[i].apply(this)
    }
  }
})
