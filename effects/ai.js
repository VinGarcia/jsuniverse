require('./effect.js')

AI = Effect.extend({
  init : function(func) {
    this.apply(Time)
    this.apply(Space)

    this.add( func )
  }
})
