
![JSUniverse](icon.jpg)

JSUniverse is generic 2D game engine made to be flexible and extensible.
The base model is really simple and is extensible by adding new Objects and new Effects in a straightforward way.

## Testing

To quickly run the engine on a sample code use:

```bash
make
# or
node engine.js
```

## Model

Everything is either an `Object` or an `Effect`.

Any `Object` is an instance of a Class whose super-classes contain all the functionalities it needs.

For example a Dog class should inherit from:

- `Space`, since it has a position in space.
- `Body`, since it is a form in space, e.g. (a Circle or a Polygon).
- `Collide`, since it can collide with any other collidable object.
- `Alive`, since it has HP, and may die.
- `AI`, since you probably want it to move. And AI is a child class of Time, so it will be updated on every cycle of clock.

The code snippet below exemplify how easy it is:

```Javascript
require('./effects/alive.js')
/* ... the other effects should also be required here ... */

var dog = new Class()
Universe.new (
  dog
    .apply(Alive, 10, 1) // max HP=10, HP regen=1
    .apply(Space, 4, 4) // Starting position: x=4, y=4
    // .apply(Body, 3) // A circle with radius=3
    .apply(Body, [[1,1],[1,-2],[-2,1],[-2,-2]]) // A Polygon with 4 edges of the same size (a square)
    .apply(Collide)
    .apply(AI, movement) // A behavior given by the movement function.
)

Universe.start()
```

The reason it is named JSUniverse is because every object and every effect share a single global variable, namely: the Universe.

When a new `Effect` is declared, e.g. `Space`, it will register itself in the `Universe`, e.g. estabilishing the universe height and width.

When a new `Object` is instantiated, it will not exist until it is added to the Universe's object list.
There this new Object will be subject to all effects that were registered on the Universe.

To register an effect all you need to do is `require()` it, and it does the job by itself.

## Features

- Custom Body definition, meaning you can define a format for you object in terms of Polygon vertexes or a Circle radius.
- Collision calculation (not 100% working, but the hard part is done).
- Built-in classes for describing characters and objects behaviors in the universe.

## TODO

- Fix some collision problems
- Make a toy-game to test the engine.
