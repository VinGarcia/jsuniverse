require('./time.js')

Alive = Time.extend({
  dead : false,
  ko : false,
  hp : 10,
  maxhp : 10,
  regen : 2,
  init : function(maxhp, regen) {
    this.hp = maxhp
    this.maxhp = maxhp
    this.regen = regen || maxhp / 5

    // Efeito passivo:
    this.add(
        function() {
          // KO condition:
          if( this.hp <= 0 )
            this.ko = true
          else
            this.ko = false

          // Death condition:
          if( this.hp < -this.maxhp )
            this.dead = true
          else
            this.dead = false

          // Regen process:
          if(this.hp < this.maxhp && !this.dead) {
            this.hp += this.regen
            if(this.hp > this.maxhp)
              this.hp = this.maxhp
          }
        }
      )
  }
})
