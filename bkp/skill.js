
// Mecanica de efeito passivo
// Mecanica de efeito ativo
// Mecanica de target finding

function Skill(args) {

  var object;

  // Default ok function:
  this.ok = function(obj) {
    for(var key in obj)
      if(typeof obj[key] == 'number' && obj[key] < 0)
        return false;
  }

  var effects = []

  if(typeof 'args' != 'object')
    args = {}

  if(typeof args.object == 'object')
    object = args.object

  if(typeof args.ok == 'function')
    ok = args.ok

  if(args.effects instanceof Array)
    for(var i in args.effects)
      if(args.effects[i] instanceof Effect) {
        args.effects[i].object = object;
        effects.push(args.effects[i]);
      }
  
  this.__cost__ = function() {
    var total = {}

    for(var i in effects) {
      // Status change:
      var change = effects[i].__cost__()
      for(var key in change)
        total[key] += change[key]
    }
    return total;
  }

  this.__apply__(enviroment) {
    if(!enviroment instanceof Enviroment)
      enviroment = undefined

    for(var i in this.effects)
      this.effects[i].__apply__(object, enviroment)
  }
}

// Incomplete
function sum(a, b) {
  if(typeof a != 'object' || typeof b != 'object')
    return undefined;

  for(var i in b) {
    if(typeof a[i] == 'number')
      a[i] += b[i]
    else if(!a.hasOwnProperty(i))
      a[i] = b[i];
  }

  return a
}

function Effect(args) {
  // Apply the effect over the object.
  this.__apply__ = function(){}

  // Return an object with the attributes
  // that will be spendend and its amounts.
  // If can't be used yet it returns null.
  this.__cost__ = function(){}

  // Read any parameters given:
  if(typeof args == 'object')
    for(var key in args)
      this[key] = args[key];
}

[
  // When a skill is activated
  triggers,
  // What the skill does
  effect,
  // How to obtain the target for the skill
  target,
]
