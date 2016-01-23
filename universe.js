
Universe = {
  'objs' : [],

  'new' : function(obj) {
    this.objs.push(obj)
    return this
  },

  'triggers' : [],
  'add' : function(trigger) {
    this.triggers.push(trigger)
    return this
  },

  'update' : function() {
    for(var i in this.triggers)
      this.triggers[i].apply(this)
  },

  'start' : function() {
    function update(){ Universe.update() }
    setInterval(update, 500)
  }
}




