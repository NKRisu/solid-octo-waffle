# Video notes from a JavaScript video from Microsoft Learn

## Video 1:

- Intro video, quick basics of how the video series works, who the people behind it are and what basic knowledge is expected from the people going through the series.

---

## Video 2:

- Basics of JS, what it's used for, why would anyone want to learn and use JS.
- Where it's mostly used for, such as web sites, desktop apps and server frameworks.
- JS is very flexible and usable code-language capable of doing basically everything i suppose.

---

## Video 3:

- Server JS vs Client JS.
- Client JS is usually web browser, usually by having JS-files referenced with script-tag in HTML-file of the website.
- Server JS usually a service that handles files, databases etc. node.js used to allow execution of JS code.

---

## Video 4:

- TOOOOOOOOOOOOOOOOLS
- What all you need to write and create JS-based applications. Such as IDE, Node, extensions etc.
- Includes some handy extensions (which i already have)

---

## Video 5:

- Installing VSCode and Node.
- I had Node and VSCode installed, so I just opened VSCode and checked versions and updated them.

---

## Video 6:

- First JS application creation with Node.JS
- Simple console.log() thingy to show how logs can be done cleanly in terminal.

---

## Video 7:

- Commenting on my code.
- How, when and why comments matter. Such as leaving reminders, taking code blocks out with just commenting them out or leaving tips on how a function works.
- Do's and Do nots.
- Code is self documenting with clear variable names, function names etc, study programs may have everything commented out to explain each line in order to hammer in what code does.

---
## Video 8:

- Showing comments. Waow.

---
## Video 9:

- Declaring variables, how JS works with vars.
- var vs const vs let,
- var is overall variable, can be used anywhere, can be any type and can be changed same as any other
- let is similar to var, just code block scope and after declaration
- const is constant, cannot be changed, same scope as let
- const default, let in loops, var is bit too openly available

---
## Video 10:

- Using said variables in code and chit chat about different types of variables.
- 

---
## Video 11:

- Text variable (strings) formatting
- JS can be funky with concanetation with strings and numbers

---
## Video 12:

- utilisation of string formatting in code and examples
- 

---
## Video 13:

- Template literals, uses backticks and ${} placeholders
- `Hello ${string1}` => Hello World!, if string1 has been set to be "World!"
- often just easier to use the variable names instead of template literals... but I guess it's just what you want to do.

---
## Video 14:

- Usage of template literals in examples
- Allows handling of modifiers or functions in the template literal line => the result of the change is printed or shown in console/webpage/app whatever.

---
## Video 15:

- Data types
- Variable types are automatically assigned, and they can be re-assigned later.
- Checking type can be a bit confusing as it gives the type that was used to create variable and not what the variable type is.
- double = => coerce types, triple = => "safe" comparison.

---
## Video 16:

- Examples showing the quirky JS constructor based check in instanceof vs typeof.

---
## Video 17:

- Math quirks in JS.
- Normal math operators and Math object (Math.whatever())

---
## Video 18:

- Demo of the math operators and object
- 

---
## Video 19:

- Changing type of variable between two types, number => string or integer => float (1 2 3 4... to 1.2 or 45.321)
- Strings to numbers with ParseInt, works for hexadecimal etc.
- ParseFloat for floats 

---
## Video 20:

- Demo of the number conversions and string conversions.
- 

---
## Video 21:

- Error handling with try/catch/finally clauses.
- Try - block of code that may throw exception-
- Catch - block of code that runs if exception is thrown-
- Finally - optional codeblock that will run after try/catch blocks - <- always runs.

---
## Video 22:

- Demo of try/catch/finally.
- Examples of why one might want to throw exceptions in code.

---
## Video 23:

- Date handling in JS.
- Month stats from zero.
- Date counted from Jan 1st 1970 in milliseconds.

---

## Video 24:

- Demo of the simple date functions in JS.

---
## Video 25:

- Booleans. True False / if logic and operators.
- double equals and triple equals from way above... ^
- 

---

## Video 26:

- Demo of that...
- Highlighting the oddities with == / === or != / !==
- Handy inline simple if check.

---
## Video 27:

- Other boolean stuff / Switch.
- Empty string = false, 0 is false, null object is false...
- && and ||
- Switch allows simpler syntax for lot of simple if statements with cases. ONLY does equality

---
## Video 28:

- Demo of more ifs and bool loops and switch statements.
- Remember breaks in switch statements.

---

v## Video 29:

- Arrays. so lists, collections etc.
- Indexed, starts at 0.

---

## Video 30:

- Demo of array creation, array length usage and index usage.
- 

## Video 31:

- Adding values to arrays.
- Overwriting values in array, using indexes.
- 

## Video 32:

- Demo of array creation etc.
- 

## Video 33:

- Different methods you can use on arrays.
- pop removes last, push adds to end of array, shift removes first, unshift moves everything up an index and adds new item to start of an array.
- concat combines two arrays.

## Video 34:

- Deeper look into array methods with demos.
- 

## Video 35:

- Basics of loops.
- WHILE/FOR.
- Iteration over lists, executing same code multiple times.

## Video 36:

- Demo.
- While when function returns false or NULL at end.
- For when loop number is known.
- Iteration over an array or collection of something.

## Video 37:

- Basics of functions.
- Syntax, defining and invoking functions.
- Naming.
- Parameters and return statements.

## Video 38:

- Demo of basic functions in VSCode.

## Video 39:

- Arrow functions.
- Shorter syntax for simple functions which are immediately used or assigned to vars.
- 

## Video 40:

- Demo of arrow funcs.
- 

## Video 41:

- JSON (JavaScript Object Notation).
- Ordered list of values of the object requested.
- JSON.stringify()
- JSON.parse()

## Video 42:

- Demo of creating JSONs, turning them into objects....

## Video 43:

- JavaScript objects.
- Properties, associated methods... representations of "things" in code.
- Object literal, created with {} with definitions in-between.
- new Object constructor creates a template for a new object.

## Video 44:

- Demo of object creation.
- Property fetching.
- Dot and bracket notation

## Video 45:

- Promises, asynchronous functions which take time and wait for function to get a result before doing things.
- Long running operations block execution, which blocks other tasks... so allowing functions to push themselves to background is useful.
- Oldtimey way was with callbacks, now with promises.
- Promise = object with resolve and reject part.

## Video 46:

- Demo of the promises working.
- 

## Video 47:

- Async functions.
- Promises can add bloat, wait times, managing waittimes...
- async/await is "cleaner" and syntax is basically normal code.
- 

## Video 48:

- Demo of async operations, weird stuff happening if one might have forgotten "await" keyword.
- 

## Video 49:

- Packages! Boxes!
- Package usage.
- Collection of the function code, assets and extra bits that can be used as a part of your application.
- npm init command creates package.json file, and then you can install packages etc etc...

## Video 50:

- More packages!
- Demo of getting packages via NPM, simple usage of them and setting up .env and .gitignore.

## Video 51:

- What now? series done.
- Next steps.
 

---

Submit only the link to the Markdown file in the submission box. Link: https://github.com/NKRisu/solid-octo-waffle/blob/main/javascript-video-notes.md




---
