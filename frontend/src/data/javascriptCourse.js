export const javascriptCourse = [
  // ==========================================================
  // CHAPTER 1
  // ==========================================================
  {
    id: "js-chapter-1",
    title: "The Basics: Variables & Data Types",
    description: "Learn the absolute fundamentals: how to store and manage information in JavaScript.",
    article: [
      {
        type: 'heading',
        content: "What is a Variable?"
      },
      {
        type: 'paragraph',
        content: "Think of a variable as a labeled box where you can store information. You give the box a name, and you can put different things inside it. In programming, this is crucial for remembering and working with data."
      },
      {
        type: 'heading',
        content: "Declaring Variables: `let` and `const`"
      },
      {
        type: 'paragraph',
        content: "In modern JavaScript, there are two main ways to create a variable:"
      },
      {
        type: 'paragraph',
        content: "1. **`let`**: Use `let` when you expect the value inside the box to change later. It's a re-assignable variable."
      },
      {
        type: 'code',
        content: `let score = 100;\nconsole.log(score); // Output: 100\n\nscore = 150; // We can change it!\nconsole.log(score); // Output: 150`
      },
      {
        type: 'paragraph',
        content: "2. **`const`**: Use `const` (short for constant) when you know the value will never change. If you try to change it, JavaScript will give you an error. This is great for safety!"
      },
      {
        type: 'code',
        content: `const playerName = "ZeroCool";\nconsole.log(playerName); // Output: ZeroCool\n\n// Try to uncomment the line below and see the error!\n// playerName = "AcidBurn";`
      },
      {
        type: 'heading',
        content: "The Basic Data Types"
      },
      {
        type: 'paragraph',
        content: "Variables can hold different types of data. Here are the most common ones:"
      },
      {
        type: 'paragraph',
        content: "**String**: Any piece of text, wrapped in quotes. `let greeting = \"Hello, Debugger!\";`"
      },
      {
        type: 'paragraph',
        content: "**Number**: Any number, with or without decimals. `let level = 5;` or `const pi = 3.14;`"
      },
      {
        type: 'paragraph',
        content: "**Boolean**: A simple `true` or `false` value, perfect for making decisions. `const isGameOver = false;`"
      },
    ],
    challenge: {
      title: "Fix the Welcome Message",
      description: "A simple typo is preventing the welcome message from displaying. Find the misspelled variable and fix it to pass the challenge.",
      buggyCode: `let mesage = "Welcome to BugBlitz.AI!";\nconsole.log(message);`,
      tests: [
        {
          expected_output: "Welcome to BugBlitz.AI!"
        }
      ]
    },
    quiz: [
      {
        question: "Which keyword is used to declare a variable whose value can be changed later?",
        options: ["const", "var", "let", "static"],
        correctAnswer: 2,
        explanation: "`let` is used for variables that you intend to re-assign. `const` is for constants that won't change."
      },
      {
        question: "What is the data type for a piece of text like \"Hello\"?",
        options: ["Number", "Boolean", "String", "Array"],
        correctAnswer: 2,
        explanation: "Text wrapped in quotes is always a String in JavaScript."
      },
      {
        question: "What will `const score = 10; score = 20;` result in?",
        options: ["The score becomes 20", "An error", "Nothing happens", "The score becomes 1020"],
        correctAnswer: 1,
        explanation: "You cannot re-assign a variable declared with `const`. This will throw a TypeError."
      },
      {
        question: "Which of the following is a Boolean value?",
        options: ["\"true\"", "1", "true", "0"],
        correctAnswer: 2,
        explanation: "Booleans are the specific keywords `true` and `false`, without quotes."
      },
      {
        question: "How do you write a single-line comment in JavaScript?",
        options: ["// This is a comment", "<!-- This is a comment -->", "/* This is a comment */", "# This is a comment"],
        correctAnswer: 0,
        explanation: "`//` is used for single-line comments. `/* ... */` is for multi-line comments."
      },
      {
        question: "What is the value of `x` after this code runs? `let x = 5;`",
        options: ["5", "undefined", "null", "Error"],
        correctAnswer: 0,
        explanation: "The variable `x` is declared and assigned the Number value of 5."
      },
      {
        question: "Which character is used to end most statements in JavaScript?",
        options: [": (colon)", "; (semicolon)", ". (period)", ", (comma)"],
        correctAnswer: 1,
        explanation: "Semicolons are used to terminate statements in JavaScript. While sometimes optional, it's a best practice to use them."
      },
      {
        question: "The data type for a number like `3.14` is:",
        options: ["Float", "Integer", "Decimal", "Number"],
        correctAnswer: 3,
        explanation: "JavaScript doesn't distinguish between integers and floats. All numbers, including decimals, are of the `Number` type."
      },
      {
        question: "What does `console.log()` do?",
        options: ["Stops the program", "Asks the user for input", "Displays a message on the screen", "Prints output to the developer console"],
        correctAnswer: 3,
        explanation: "`console.log()` is a fundamental debugging tool used to print information to the developer console, not the main UI."
      },
      {
        question: "Which is the correct way to declare a constant variable for a player's name?",
        options: ["let playerName = 'Alex';", "const playerName = 'Alex';", "var playerName = 'Alex';", "playerName = 'Alex';"],
        correctAnswer: 1,
        explanation: "`const` is the best choice for a value like a name that is not expected to change."
      }
    ]
  },
  // ==========================================================
  // CHAPTER 2
  // ==========================================================
  {
    id: "js-chapter-2",
    title: "Making Decisions: Operators & Control Flow",
    description: "Learn how to make your code smart with operators and if/else statements.",
    article: [
       { type: 'heading', content: "Comparison Operators" },
       { type: 'paragraph', content: "To make decisions, your code needs to compare values. JavaScript provides several operators for this:" },
       { type: 'paragraph', content: "`===` (Strictly Equal): Checks if two values are equal AND of the same type. This is the one you should almost always use." },
       { type: 'paragraph', content: "`!==` (Strictly Not Equal): Checks if two values are not equal or not of the same type." },
       { type: 'paragraph', content: "`>` (Greater than), `<` (Less than), `>=` (Greater than or equal to), `<=` (Less than or equal to)." },
       { type: 'code', content: "const myLevel = 10;\nconsole.log(myLevel === 10); // Output: true\nconsole.log(myLevel > 20); // Output: false" },
       { type: 'heading', content: "Control Flow: `if`, `else if`, `else`" },
       { type: 'paragraph', content: "This is the core of decision-making. The `if` statement runs a block of code only if a certain condition is true." },
       { type: 'code', content: "const score = 95;\n\nif (score > 90) {\n  console.log(\"Excellent work!\");\n}\n\n// Output: Excellent work!" },
       { type: 'paragraph', content: "You can add an `else` block to run code if the condition is false, and an `else if` block to check multiple conditions in a row." },
       { type: 'code', content: "const health = 75;\n\nif (health > 80) {\n  console.log(\"Status: Healthy\");\n} else if (health > 40) {\n  console.log(\"Status: Injured\");\n} else {\n  console.log(\"Status: Critical!\");\n}\n\n// Output: Status: Injured" },
    ],
    challenge: {
      title: "Fix the Grading System",
      description: "The grading logic is flawed. A score of 85 should result in a 'B', but it's not. Fix the comparison operator to correctly assign the grades.",
      buggyCode: `function getGrade(score) {\n  if (score > 90) {\n    return 'A';\n  } else if (score > 80) {\n    return 'B';\n  } else if (score > 70) {\n    return 'C';\n  } else {\n    return 'D';\n  }\n}\nconsole.log(getGrade(85));`,
      tests: [ { expected_output: "B" } ]
    },
    quiz: [
        { question: "Which operator checks for both equal value AND equal type?", options: ["=", "==", "===", "!="], correctAnswer: 2, explanation: "`===` is the strict equality operator and is the safest choice for comparisons in JavaScript." },
        { question: "What will `if (score > 50)` do if `score` is 40?", options: ["Run the code inside the if block", "Skip the code inside the if block", "Cause an error", "Run the code twice"], correctAnswer: 1, explanation: "Since 40 is not greater than 50, the condition is false, and the code inside the `if` block is skipped." },
        { question: "Which keyword is used to provide a default action if all `if` and `else if` conditions are false?", options: ["default", "otherwise", "catch", "else"], correctAnswer: 3, explanation: "The `else` block is the final catch-all that runs when no preceding conditions are met." },
        { question: "What is the result of `100 >= 100`?", options: ["true", "false", "undefined", "Error"], correctAnswer: 0, explanation: "The `>=` operator means 'greater than OR equal to'. Since 100 is equal to 100, the condition is true." },
        { question: "What does the `else if` statement allow you to do?", options: ["End the program", "Run code if the first `if` is false", "Check another condition if the first `if` is false", "Combine two variables"], correctAnswer: 2, explanation: "`else if` is used to create a chain of conditions, checking a new one only if the previous one was false." },
        { question: "What is the opposite of `===`?", options: ["==", "!==", "!=", "<>"], correctAnswer: 1, explanation: "`!==` is the strict inequality operator, checking for a difference in either value or type." },
        { question: "If `health = 30`, what will be logged? `if (health > 50) { console.log('OK'); } else { console.log('Low'); }`", options: ["OK", "Low", "Nothing", "Error"], correctAnswer: 1, explanation: "Since 30 is not greater than 50, the `if` condition is false, so the code in the `else` block is executed." },
        { question: "The `&&` operator means:", options: ["OR", "NOT", "AND", "XOR"], correctAnswer: 2, explanation: "`&&` is the logical AND operator. It returns true only if both conditions on its left and right are true." },
        { question: "The `||` operator means:", options: ["OR", "NOT", "AND", "XOR"], correctAnswer: 0, explanation: "`||` is the logical OR operator. It returns true if at least one of the conditions on its left or right is true." },
        { question: "A value that is considered `false` in a condition (like 0 or \"\") is called:", options: ["truthy", "falsy", "nully", "void"], correctAnswer: 1, explanation: "In JavaScript, certain values like `0`, `\"\"`, `null`, `undefined`, and `false` itself are 'falsy' and will fail an `if` condition." },
    ]
  },
  // ==========================================================
  // CHAPTER 3
  // ==========================================================
  {
    id: "js-chapter-3",
    title: "Repetition is Key: Loops",
    description: "Learn how to automate repetitive tasks using `for` and `while` loops.",
    article: [
       { type: 'heading', content: "Why Use Loops?" },
       { type: 'paragraph', content: "Imagine you need to print 'Hello' 5 times. You could write `console.log('Hello');` five times, but what if you needed to do it 500 times? Loops are a fundamental programming concept that lets you run a block of code over and over again." },
       { type: 'heading', content: "The `for` Loop" },
       { type: 'paragraph', content: "The `for` loop is the most common type. It's perfect when you know exactly how many times you want to repeat an action. It has three parts: initialization, condition, and increment." },
       { type: 'code', content: "//   (1)      (2)       (3)\nfor (let i = 0; i < 5; i++) {\n  // (1) Initialization: Runs once at the start.\n  // (2) Condition: Checked before each run. If false, the loop stops.\n  // (3) Increment: Runs after each time the code block is executed.\n\n  console.log(\"This is loop number\", i + 1);\n}" },
       { type: 'heading', content: "The `while` Loop" },
       { type: 'paragraph', content: "The `while` loop is simpler. It keeps running as long as its condition is true. It's useful when you don't know exactly how many iterations you'll need." },
       { type: 'code', content: "let health = 100;\n\nwhile (health > 0) {\n  console.log(\"Health is\", health, \"- Attacking!\");\n  health = health - 20; // It's crucial to change the condition inside the loop!\n}\n\nconsole.log(\"Player defeated!\");" },
       { type: 'paragraph', content: "**Warning:** Be careful with `while` loops! If you forget to include code that eventually makes the condition false, you'll create an infinite loop and crash your program." },
    ],
    challenge: {
      title: "Fix the Countdown",
      description: "This code is supposed to count down from 5 to 1, but it's stuck in an infinite loop! Find the bug in the loop's logic to make it stop.",
      buggyCode: `let i = 5;\nwhile (i > 0) {\n  console.log(i);\n  // A vital piece of logic is missing here!\n}`,
      tests: [ { expected_output: "5\n4\n3\n2\n1" } ]
    },
    quiz: [
        { question: "Which loop is best when you know you need to run code exactly 10 times?", options: ["while", "if", "for", "do-while"], correctAnswer: 2, explanation: "The `for` loop is designed for situations where the number of iterations is known beforehand." },
        { question: "What are the three parts of a `for` loop's parentheses?", options: ["start, middle, end", "condition, increment, variable", "initialization, condition, increment", "variable, check, change"], correctAnswer: 2, explanation: "A `for` loop is defined by its initialization (e.g., `let i = 0`), its condition (e.g., `i < 10`), and its increment (e.g., `i++`)." },
        { question: "What happens if a `while` loop's condition never becomes false?", options: ["It runs once and stops", "It skips the loop", "It creates an infinite loop", "It causes a syntax error"], correctAnswer: 2, explanation: "An infinite loop occurs when the condition for a `while` loop always evaluates to true, causing the program to hang." },
        { question: "In `for (let i = 0; i < 5; i++)`, how many times will the code block run?", options: ["4", "5", "6", "0"], correctAnswer: 1, explanation: "The loop runs for i = 0, 1, 2, 3, and 4. When `i` becomes 5, the condition `5 < 5` is false, and the loop stops. That's 5 iterations." },
        { question: "What does `i++` mean?", options: ["i equals plus plus", "Add 2 to i", "Multiply i by itself", "Add 1 to i"], correctAnswer: 3, explanation: "`i++` is a common shorthand for `i = i + 1`, known as the increment operator." },
        { question: "Which loop will always execute its code block at least once?", options: ["for", "while", "do-while", "if"], correctAnswer: 2, explanation: "A `do-while` loop checks its condition *after* the code block runs, guaranteeing at least one execution." },
        { question: "What is the purpose of the 'initialization' part of a `for` loop?", options: ["To end the loop", "To set up the starting state of the loop variable", "To check the condition", "To run after the loop finishes"], correctAnswer: 1, explanation: "The initialization (e.g., `let i = 0`) runs only once at the very beginning to create the counter variable." },
        { question: "How would you loop through an array called `myArray`?", options: ["for (let i = 0; i < myArray.length; i++)", "for (let i = 1; i <= myArray.length; i++)", "while (myArray)", "if (myArray.length > 0)"], correctAnswer: 0, explanation: "The standard `for` loop is a classic way to iterate through an array from the first element (index 0) to the last." },
        { question: "What keyword can be used to exit a loop early?", options: ["stop", "exit", "continue", "break"], correctAnswer: 3, explanation: "The `break` statement immediately terminates the current loop and continues execution at the statement following the loop." },
        { question: "What keyword can be used to skip the current iteration and move to the next?", options: ["skip", "next", "continue", "pass"], correctAnswer: 2, explanation: "The `continue` statement skips the rest of the code in the current iteration and jumps to the next one." },
    ]
  },
  // ==========================================================
  // CHAPTER 4
  // ==========================================================
  {
    id: "js-chapter-4",
    title: "Building Blocks: Functions",
    description: "Learn how to create reusable blocks of code with functions.",
    article: [
       { type: 'heading', content: "What is a Function?" },
       { type: 'paragraph', content: "A function is a reusable block of code that performs a specific task. You can 'call' a function whenever you need it, which helps keep your code organized and prevents you from repeating yourself (a principle known as DRY - Don't Repeat Yourself)." },
       { type: 'heading', content: "Defining and Calling a Function" },
       { type: 'paragraph', content: "You define a function using the `function` keyword, followed by a name, parentheses `()`, and curly braces `{}`." },
       { type: 'code', content: "// Defining the function\nfunction greet() {\n  console.log(\"Hello from the function!\");\n}\n\n// Calling the function\ngreet(); // Output: Hello from the function!" },
       { type: 'heading', content: "Parameters and Arguments" },
       { type: 'paragraph', content: "Functions can be made more powerful by accepting inputs. 'Parameters' are the variables you list in the function's definition. 'Arguments' are the actual values you pass in when you call it." },
       { type: 'code', content: "// 'name' is the parameter\nfunction greetUser(name) {\n  console.log(\"Hello, \" + name + \"!\");\n}\n\n// \"Pratham\" is the argument\ngreetUser(\"Pratham\"); // Output: Hello, Pratham!" },
       { type: 'heading', content: "Returning Values" },
       { type: 'paragraph', content: "Functions can also send a value back to the code that called it. This is done with the `return` keyword. When a function hits a `return` statement, it immediately stops and sends back the value." },
       { type: 'code', content: "function add(a, b) {\n  return a + b;\n}\n\nconst sum = add(5, 10);\nconsole.log(sum); // Output: 15" },
    ],
    challenge: {
      title: "Fix the Adder",
      description: "This function is supposed to add two numbers and give back the result, but it's not working. The function is missing a crucial keyword.",
      buggyCode: `function addNumbers(num1, num2) {\n  const result = num1 + num2;\n  // Something is missing here!\n}\n\nconst total = addNumbers(10, 20);\nconsole.log(total);`,
      tests: [ { expected_output: "30" } ]
    },
    quiz: [
        { question: "What is the main purpose of a function?", options: ["To stop the code", "To store a single value", "To create a reusable block of code for a task", "To create a loop"], correctAnswer: 2, explanation: "Functions allow you to encapsulate logic for a specific task and reuse it, which is a core principle of programming." },
        { question: "In `function greet(name)`, `name` is a(n)...", options: ["argument", "parameter", "variable", "string"], correctAnswer: 1, explanation: "The variable listed in the function definition is called a parameter. The value you pass in when you call it is the argument." },
        { question: "What does the `return` keyword do?", options: ["Prints to the console", "Stops the function and sends a value back", "Starts the function", "Declares a variable"], correctAnswer: 1, explanation: "`return` is essential for getting values *out* of a function so they can be used elsewhere in your code." },
        { question: "How do you call a function named `myFunction`?", options: ["call myFunction;", "myFunction;", "myFunction()", "run myFunction;"], correctAnswer: 2, explanation: "To execute a function, you write its name followed by parentheses `()`." },
        { question: "What is the value of `result`? `function calc() { let x = 5; } let result = calc();`", options: ["5", "null", "Error", "undefined"], correctAnswer: 3, explanation: "The `calc` function doesn't have a `return` statement, so it implicitly returns `undefined`." },
        { question: "Variables declared with `let` or `const` inside a function are...", options: ["Global and accessible everywhere", "Local and only accessible inside that function", "Permanent", "Always strings"], correctAnswer: 1, explanation: "This concept is called 'scope'. Variables declared inside a function are local to that function and cannot be accessed from the outside." },
        { question: "What are the values you pass into a function called?", options: ["parameters", "arguments", "inputs", "data"], correctAnswer: 1, explanation: "The actual values passed during a function call, like `5` in `myFunc(5)`, are called arguments." },
        { question: "Can a function call another function?", options: ["Yes", "No", "Only if it's a `while` loop", "Only if it's a `const` function"], correctAnswer: 0, explanation: "Yes, functions calling other functions is a fundamental part of building complex applications." },
        { question: "What does DRY stand for in programming?", options: ["Don't Run Yesterday's-code", "Do Repeat Yourself", "Don't Repeat Yourself", "Data Runs Yearly"], correctAnswer: 2, explanation: "Don't Repeat Yourself (DRY) is a principle of software development aimed at reducing repetition of code by using abstractions like functions." },
        { question: "What will `console.log(add(2, 3))` output if `function add(a, b) { return a + b; }`?", options: ["2", "3", "5", "undefined"], correctAnswer: 2, explanation: "The `add` function returns the sum of `a` and `b`, which is 5. `console.log` then prints that returned value." },
    ]
  },
  // ==========================================================
  // CHAPTER 5
  // ==========================================================
  {
    id: "js-chapter-5",
    title: "Organizing Data: Arrays & Objects",
    description: "Learn the two most important ways to store collections of data in JavaScript.",
    article: [
       { type: 'heading', content: "What is an Array?" },
       { type: 'paragraph', content: "An array is an ordered list of items. It's like a numbered list where the numbering starts at 0. You create an array with square brackets `[]`." },
       { type: 'code', content: "const team = [\"Pratham\", \"ZeroCool\", \"AcidBurn\"];\n\n// Access items by their index (position)\nconsole.log(team[0]); // Output: Pratham\nconsole.log(team[2]); // Output: AcidBurn" },
       { type: 'heading', content: "What is an Object?" },
       { type: 'paragraph', content: "An object is a collection of key-value pairs. Instead of a numbered list, it's like a dictionary or a contact card where you store related information under specific labels (keys). You create an object with curly braces `{}`." },
       { type: 'code', content: "const player = {\n  name: \"CrashOverride\",\n  level: 15,\n  isAdmin: false\n};\n\n// Access values by their key\nconsole.log(player.name); // Output: CrashOverride\nconsole.log(player.level); // Output: 15" },
       { type: 'heading', content: "When to Use Which?" },
       { type: 'paragraph', content: "It's simple: use an **Array** when the order of items matters (like a to-do list or a list of players in a queue). Use an **Object** to group together related properties that describe a single thing (like a user's profile)." },
    ],
    challenge: {
      title: "Get the Last Item",
      description: "This function is supposed to get the last item from a list (array), but it's trying to access an index that doesn't exist. This is a classic 'off-by-one' error.",
      buggyCode: `function getLastItem(items) {\n  const lastIndex = items.length;\n  return items[lastIndex];\n}\n\nconst tools = ['Compiler', 'Debugger', 'Linter'];\nconsole.log(getLastItem(tools));`,
      tests: [ { expected_output: "Linter" } ]
    },
    quiz: [
        { question: "How do you create an empty array?", options: ["let arr = {};", "let arr = [];", "let arr = ();", "let arr = new Array;"], correctAnswer: 1, explanation: "Square brackets `[]` are used to define an array literal." },
        { question: "In an array, the first element is at which index?", options: ["1", "-1", "0", "A"], correctAnswer: 2, explanation: "Arrays in JavaScript (and most programming languages) are zero-indexed, meaning the first item is at index 0." },
        { question: "How do you access the `email` property of an object called `user`?", options: ["user[email]", "user.get('email')", "user(email)", "user.email"], correctAnswer: 3, explanation: "Dot notation (`.`) is the most common way to access properties on an object." },
        { question: "What characters are used to define an object?", options: ["[] (square brackets)", "() (parentheses)", "{} (curly braces)", "<> (angle brackets)"], correctAnswer: 2, explanation: "Curly braces `{}` are used to define an object literal." },
        { question: "If `const letters = ['a', 'b', 'c'];`, what is `letters[1]`?", options: ["a", "b", "c", "undefined"], correctAnswer: 1, explanation: "The element at index 1 is the second element in the array, which is 'b'." },
        { question: "Which is best for storing a user's profile with `name`, `email`, and `id`?", options: ["An Array", "A String", "A Number", "An Object"], correctAnswer: 3, explanation: "An object is perfect for grouping related key-value pairs that describe a single entity." },
        { question: "What does `myArray.length` give you?", options: ["The first item", "The last item", "The total number of items in the array", "The index of the last item"], correctAnswer: 2, explanation: "The `.length` property of an array tells you how many items it contains." },
        { question: "How do you add a new item to the end of an array called `myArray`?", options: ["myArray.add('newItem')", "myArray.push('newItem')", "myArray.append('newItem')", "myArray[myArray.length] = 'newItem'"], correctAnswer: 1, explanation: "The `.push()` method is the standard way to add one or more elements to the end of an array." },
        { question: "What is `user.age` if `const user = { name: 'Alex' };`?", options: ["null", "0", "Error", "undefined"], correctAnswer: 3, explanation: "If you try to access a property that doesn't exist on an object, JavaScript returns `undefined`." },
        { question: "An array is an ordered list of items, while an object is a collection of...", options: ["ordered numbers", "functions", "key-value pairs", "strings"], correctAnswer: 2, explanation: "The fundamental structure of an object is its collection of keys (like `name`) and their corresponding values (like 'Pratham')." },
    ]
  }
];
