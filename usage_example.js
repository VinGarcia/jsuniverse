

Space = Class.extend(new function() {
  // Instalação do espaço no Universo:
  Universe.largura = 10
  Universe.altura = 20
  
  // Instalação da habilidade em um personagem (ou em um objeto do jogo):
  this.x = 0
  this.y = 0
  this.init = function(x,y) {
    this.x = x
    this.y = y
  }
})

// Uso em um personagem:
personagem = new Class

personagem.apply(Space)
personagem.apply(Time)
personagem.apply(Etc)

// ou:
personagem.apply(Space)
  .apply(Time)
  .apply(Etc)
