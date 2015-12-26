require('./effect.js')

AI = Effect.extend({
  init : function(func) {
    if(!this.instanceof(Time))
      this.apply(Time)

    if(!this.instanceof(Space))
      this.apply(Space)

    this.add( func )
  }
})
