
exports.creature = creature;
function creature(options) {

  options = options || {};

  var effects = []

  // Level of strength of this creature:
  var power = options.power || 5;

  var base = options.status ||
  {
    'd': power,
    'a': power,
    'i': power,
    'v': power,
    'f': power
  }

  var mod = {
    'd': base['d'],
    'a': base['a'],
    'i': base['i'],
    'v': base['v'],
    'f': base['f']
  }

  this.status = status;
  function status() {
    return {
      'd': mod['d'],
      'a': mod['a'],
      'i': mod['i'],
      'v': mod['v'],
      'f': mod['f']
    }
  }

  this.update = update;
  function update() {
    for(var i in effects) {
      effect = effects[i]
      if(effect != null && effect != undefined)
        effect(mod, effects)
    }
  }

  this.effect = effect;
  function effect(func, target) {
    effects.push(func, target);
    return this;
  }

  var defences = []
  var dodge_cap = mod['a']
  var hp = mod['v']

  this.defend = defend;
  function defend(damage) {

    hp_dmg = damage - dodge_cap;
    if(hp_dmg < 0) hp_dmg = 0;

    dodge_cap = dodge_cap - damage;
    if(dodge_cap < 0) dodge_cap = 0;

    // Apply the defensive effects
    for(var i in defences) {
      hp_dmg = defences[i](hp_dmg, mod)
    }

    // If the damage was bigger than the dodge capability:
    hp -= hp_dmg;

    updateState(hp);
    
  }

  this.disable = false;
  this.unconcious = false;
  this.dead = false;
  function updateState(hp) {
    if(hp > 0) {
      this.disable = false;
      this.unconcious = false;
      this.dead = false;
    }

    if(hp == 0) {
      this.disable = true;
      this.unconcious = false;
      this.dead = false;
    }

    if(hp < 0) {
      this.disable = false;
      this.unconcious = true;
      this.dead = false;
    }

    if(hp < -mod['v']) {
      this.disable = false;
      this.unconcious = false;
      this.dead = true;
    }
  }
}








