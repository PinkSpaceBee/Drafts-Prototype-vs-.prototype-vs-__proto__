const plant = {
    isGreen: 'sometimes',
    isAlive: true,
}

const tree = {
    isTall: true,
    walk() {
        return `...it's a tree`;
    }
}

Object.setPrototypeOf(tree, plant);

const oak = Object.create(tree);

function Flower(name) {
    this.name = name;
    this.isPretty = true;
    this.waterIt = function() {
        return 'it seems to like it!'
    }
}

Flower.prototype.walk = function() {
    return `it can't :(`;
}

Object.setPrototypeOf(Flower, plant);

const marigold = Object.create(Flower.prototype);
marigold.name = 'marigold';

const peony =  new Flower('peony');

/*
console.dir() different things:
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
Flower 
    .prototype {
        constructor: f Flower()
        __proto__: Object
        [[Prototype]]: Object
    }
    [[Prototype]]: f ()
    
So Flower has [[Prototype]] as a function, but also Flower's prototype 
property (which all functions have) has its own [[Prototype]]. Interestingly, 
the constructor property also has a prototype property (although, on second 
thought, it seems self-evident as constructor property returns a reference to 
the Object constructor function)
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
Flower.prototype
    walk: f ()
    constructor: f Flower()
    __proto__ : Object
    [[Prototype]]: Object
If we look up the __proto__ of the Object, we'll get a null, which is obvious 
but still worth mentioning. 

--> Object.getPrototypeOf(Flower.prototype) === Flower.prototype.__proto__
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
Object.getPrototypeOf(Flower.prototype) 
    constructor: f Object()
    __proto__: null

Object.prototype
    constructor: f Object()
    __proto__: null
    [[Prototype]]: null // tbh console.dir doesn't even display such a property 
    in this case, but the constructor property HAS the [[Prototype]] property, 
    and its value is f (), i.e. the built-in function object with methods and such
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
Flower.prototype.walk() // works
Flower.walk() // throws an error (Flower.walk is not a function)
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
Every object has the [[Prototype]] property. 

Every function (there are exceptions but you got the gist) has the .prototype 
property AND the [[Prototype]] property. 

[[Prototype]] property holds a reference to the object's prototype. It can be 
set manually, just as I set Flower's [[Prototype]] to the plant object. So now, if I access Flower, I get this:

Flower
    name: 'Flower' 
    .prototype
        walk()
    [[Prototype]]
        isAlive: true
        isGreen: 'sometimes'

As you can see, there's no sign of isPretty and waterIt(). These properties are 
accessable by the peony, but not by the marigold and the Flower itself. BUT the 
name property is there and is accessible by the Flower and its instances.

Honestly, it seems kinda convoluted. Like, if I access tree, I get this:

tree 
    isTall: true
    walk: f walk()
    [[Prototype]]
        isAlive: true
        isGreen: 'sometimes'

In this case, both children of the tree and the tree itself can access its properties.         

So, as I see it, the name prop of the Flower works just as the isTall prop of the tree. 

Now, look at this! 

peony 
    Flower
        isPretty: true
        name: 'peony'
        waterIt: f ()
        [[Prototype]]: Object
            walk: f ()
            constructor: f Flower(name)
            [[Prototype]]: Object

marigold 
    Flower 
        name: 'marigold'
        [[Prototype]]: Object
            walk: f()
            constructor: f Flower(name)
            [[Prototype]]: Object

The method console.dir() displays a list of properties of the object passed as 
an argument. So it appears that isPretty is a property of the peony object but 
not the Flower constructor function. 

Oooh, I get it now, look:

A constructor function is just a regular function, and it's declared as a regular function. All the magic happens when you execute it using the new keyword. 

// when I write this
const peony = new Flower('peony')

1 A new empty object is created and assigned to .this.
2 The function body is executed. Usually, it adds new properties to .this.
3 The value of .this is returned.

function Flower(name) {
    // this = {}

    //properties are assigned to .this
    this.name = name;
    this.isPretty = true;
    this.waterIt = function() {
        return 'it seems to like it!'
    }

    // return .this
}

And this is why Flower.isPretty returns undefined: you didn't invoke the 
function with the new keyword, and therefore the new object wasn't created. 
A newly created peony object is just it - an object, and it doesn't have exclusive to functions .prototype property. 

Flower's [[Prototype]] property references the plant object, its prototype.
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
__proto__ is just an outdated getter for [[Prototype]]

.prototype !== [[Prototype]], as in 
foo.prototype !== Object.getPrototypeOf(foo), or, interchangeably,
foo.prototype !== foo.__proto__

Flower's .prototype property references the object that is created when the 
function is invoked as a constructor, so, obviously:

peony.__proto__ === Flower.prototype

Fi-fucking-nally! I finally get it! 
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
Oh, and the last bit. I see that Object.create() works differently from 
const obj = new Obj(). As I found out earlier, when I invoke the function with 
the new keyword, the new empty object is created and filled with properties
from the parent function. [[Prototype]] is defined as parent.prototype. 

Apparently, when I use the Object.create() method, the children's [[Prototype]]
IS defined as parent.prototype, but, since there's no function invoked with the
new keyword, the new empty object isn't being created and filled with parent's properties. 

OK NOW I get it. 
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
One more thing: you can't just create a new object, let's say, sunflower, and
explicitly state it's prototype as the Flower constructor:

sunflower.__proto__ = Flower

Yeah, it would've worked if the Flower were a regular object created
using object literal syntax (i.e. const flower = {}). But, since it's a
constructor function, it can't pass its properties by inheritance UNLESS 
the child was created using the new keyword. No new keyword - no object
that could be populated with properties. 
*/
