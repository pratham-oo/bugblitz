export const dummyChallenges = [
  // ==========================================================
  // CLASSIC MODE (5 Levels: 1 Easy, 2 Medium, 2 Hard)
  // ==========================================================
  {
    id: "classic-1",
    mode: "classic",
    title: "Find the Maximum Number",
    description: "This function should find the largest number in a list. It fails when all the numbers in the list are negative.",
    difficulty: "easy",
    minLevel: 1,
    xpReward: 100,
    variants: {
      python: [`def find_max(numbers):\n    # Bug: Initializing with 0 fails for negative numbers\n    max_num = 0\n    for num in numbers:\n        if num > max_num:\n            max_num = num\n    return max_num`],
      javascript: [`function findMax(numbers) {\n    // Bug: Initializing with 0 fails for negative numbers\n    let maxNum = 0;\n    for (const num of numbers) {\n        if (num > maxNum) {\n            maxNum = num;\n        }\n    }\n    return maxNum;\n}`]
    },
    callCode: {
      python: `import sys\nlst = list(map(int, sys.stdin.read().strip().split()))\nprint(find_max(lst))`,
      javascript: `const fs = require('fs');\nconst arr = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(findMax(arr));`
    },
    tests: [ { input: "1 5 2 9 3", expected_output: "9" }, { input: "-10 -5 -2 -1", expected_output: "-1" } ]
  },
  {
    id: "classic-2",
    mode: "classic",
    title: "Remove Duplicates",
    description: "This function should remove all duplicate items from a list, keeping the first occurrence. The current logic is flawed.",
    difficulty: "medium",
    minLevel: 2,
    xpReward: 150,
    variants: {
      python: [`def remove_duplicates(items):\n    # Bug: This only removes adjacent duplicates\n    if not items:\n        return []\n    unique_items = [items[0]]\n    for i in range(1, len(items)):\n        if items[i] != items[i-1]:\n            unique_items.append(items[i])\n    return unique_items`],
      javascript: [`function removeDuplicates(items) {\n    // Bug: This only removes adjacent duplicates\n    if (!items.length) return [];\n    const uniqueItems = [items[0]];\n    for (let i = 1; i < items.length; i++) {\n        if (items[i] !== items[i-1]) {\n            uniqueItems.push(items[i]);\n        }\n    }\n    return uniqueItems;\n}`]
    },
    callCode: {
      python: `import sys\nlst = sys.stdin.read().strip().split()\nprint(" ".join(map(str, remove_duplicates(lst))))`,
      javascript: `const fs = require('fs');\nconst arr = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\nconsole.log(removeDuplicates(arr).join(' '));`
    },
    tests: [ { input: "apple banana apple orange banana", expected_output: "apple banana orange" }, { input: "1 1 2 2 1 3", expected_output: "1 2 3" } ]
  },
  {
    id: "classic-3",
    mode: "classic",
    title: "Anagram Checker",
    description: "This function should check if two strings are anagrams. The current code fails because it doesn't handle case sensitivity (e.g., 'A' vs 'a').",
    difficulty: "medium",
    minLevel: 3,
    xpReward: 150,
    variants: {
      python: [`def are_anagrams(s1, s2):\n    # Bug: Fails if strings have different cases\n    if len(s1) != len(s2):\n        return False\n    return sorted(s1) == sorted(s2)`],
      javascript: [`function areAnagrams(s1, s2) {\n    // Bug: Fails if strings have different cases\n    if (s1.length !== s2.length) {\n        return false;\n    }\n    return s1.split('').sort().join('') === s2.split('').sort().join('');\n}`]
    },
    callCode: {
      python: `s1, s2 = input().strip().split()\nprint(are_anagrams(s1, s2))`,
      javascript: `const fs = require('fs');\nconst [s1, s2] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\nconst result = areAnagrams(s1, s2);\nconsole.log(result ? 'True' : 'False');`
    },
    tests: [ { input: "listen silent", expected_output: "True" }, { input: "Listen Silent", expected_output: "True" }, { input: "hello world", expected_output: "False" } ]
  },
  {
    id: "classic-4",
    mode: "classic",
    title: "Two Sum Problem",
    description: "Find two numbers in a list that add up to a specific target. This solution has a subtle bug that uses the same element twice.",
    difficulty: "hard",
    minLevel: 4,
    xpReward: 200,
    variants: {
      python: [`def two_sum(nums, target):\n    lookup = {num: i for i, num in enumerate(nums)}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in lookup:\n            return [i, lookup[complement]]\n    return []`],
      javascript: [`function twoSum(nums, target) {\n    const lookup = new Map();\n    nums.forEach((num, i) => lookup.set(num, i));\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (lookup.has(complement)) {\n            return [i, lookup.get(complement)];\n        }\n    }\n    return [];\n}`]
    },
    callCode: {
      python: `import sys, json\nlines = sys.stdin.read().strip().split('\\n')\nnums = list(map(int, lines[0].split()))\ntarget = int(lines[1])\nresult = two_sum(nums, target)\nresult.sort()\nprint(json.dumps(result, separators=(',',':')))` ,
      javascript: `const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split('\\n');\nconst nums = lines[0].split(/\\s+/).map(Number);\nconst target = parseInt(lines[1], 10);\nconst result = twoSum(nums, target);\nresult.sort((a,b) => a-b);\nconsole.log(JSON.stringify(result));`
    },
    tests: [ { input: "2 7 11 15\n9", expected_output: "[0,1]" }, { input: "3 3\n6", expected_output: "[0,1]" } ]
  },
  {
    id: "classic-5",
    mode: "classic",
    title: "Product of Array Except Self",
    description: "Return an array where each element is the product of all other numbers. Constraint: Do not use the division operator.",
    difficulty: "hard",
    minLevel: 5,
    xpReward: 200,
    variants: {
      python: [`import math\ndef product_except_self(nums):\n    # Bug: This solution uses division, which is against the rules.\n    # It also fails if there's a zero in the list.\n    total_product = math.prod(nums)\n    return [total_product // n for n in nums]`],
      javascript: [`function productExceptSelf(nums) {\n    // Bug: This solution uses division, which is against the rules.\n    // It also fails if there's a zero in the list.\n    const totalProduct = nums.reduce((prod, num) => prod * num, 1);\n    return nums.map(num => totalProduct / num);\n}`]
    },
    callCode: {
      python: `import sys\nlst = list(map(int, sys.stdin.read().strip().split()))\nresult = product_except_self(lst)\nprint(" ".join(map(str, result)))`,
      javascript: `const fs = require('fs');\nconst arr = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst result = productExceptSelf(arr);\nconsole.log(result.join(' '));`
    },
    tests: [ { input: "1 2 3 4", expected_output: "24 12 8 6" }, { input: "2 3 0 5", expected_output: "0 0 30 0" } ]
  },

  // ==========================================================
  // REGRESSION MODE (5 Levels: 1 Easy, 2 Medium, 2 Hard)
  // ==========================================================
  {
    id: "regression-1",
    mode: "regression",
    title: "Add Greeting Method",
    description: "The User class needs a `greet()` method that returns 'Hello, <name>!'. Don't break the existing constructor.",
    difficulty: "easy",
    minLevel: 1,
    xpReward: 100,
    starterCode: { python: `class User:\n    def __init__(self, name):\n        self.name = name`, javascript: `class User {\n  constructor(name) {\n    this.name = name;\n  }\n}` },
    regressionTests: [ { testCode: { python: `u = User("Alice")\nprint(u.name)`, javascript: `const u = new User("Alice"); console.log(u.name);` }, expected_output: "Alice" } ],
    featureTests: [ { testCode: { python: `u = User("Bob")\nprint(u.greet())`, javascript: `const u = new User("Bob"); console.log(u.greet());` }, expected_output: "Hello, Bob!" } ]
  },
  { // --- THIS IS THE CHANGED ONE ---
    id: "regression-2",
    mode: "regression",
    title: "Add Friend Feature",
    description: "Add an `addFriend(friendName)` method to the User class. It should add the friend's name to the `friends` list.",
    difficulty: "medium",
    minLevel: 2,
    xpReward: 150,
    starterCode: {
      python: `class User:\n    def __init__(self, name):\n        self.name = name\n        self.friends = []`,
      javascript: `class User {\n  constructor(name) {\n    this.name = name;\n    this.friends = [];\n  }\n}`
    },
    regressionTests: [
      { testCode: { python: `u = User("A")\nprint(isinstance(u.friends, list))`, javascript: `const u = new User("A"); console.log(Array.isArray(u.friends) ? 'True' : 'False');` }, expected_output: "True" }
    ],
    featureTests: [
      // THE FIX IS HERE: Expected output now uses double quotes to match JSON.stringify
      { testCode: { python: `u = User("A")\nu.addFriend("B")\nprint(u.friends)`, javascript: `const u = new User("A"); u.addFriend("B"); console.log(JSON.stringify(u.friends));` }, expected_output: '["B"]' }
    ]
  },
  {
    id: "regression-3",
    mode: "regression",
    title: "Account Activation Toggle",
    description: "Add `activate()` and `deactivate()` methods to toggle the `isActive` property. The default should be `False`.",
    difficulty: "medium",
    minLevel: 3,
    xpReward: 150,
    starterCode: { python: `class User:\n    def __init__(self, name):\n        self.name = name\n        self.is_active = False`, javascript: `class User {\n  constructor(name) {\n    this.name = name;\n    this.isActive = false;\n  }\n}` },
    regressionTests: [ { testCode: { python: `u = User("A")\nprint(u.is_active)`, javascript: `const u = new User("A"); console.log(u.isActive ? 'True' : 'False');` }, expected_output: "False" } ],
    featureTests: [ { testCode: { python: `u = User("B")\nu.activate()\nprint(u.is_active)`, javascript: `const u = new User("B"); u.activate(); console.log(u.isActive ? 'True' : 'False');` }, expected_output: "True" } ]
  },
    { // --- THIS IS THE CHANGED ONE ---
    id: "regression-4",
    mode: "regression",
    title: "Validate Email Address",
    description: "Add a `setEmail(email)` method. It should only set the email if it contains an '@' symbol, otherwise it should do nothing.",
    difficulty: "hard",
    minLevel: 4,
    xpReward: 200,
    starterCode: {
      python: `class User:\n    def __init__(self, name):\n        self.name = name\n        self.email = None`,
      javascript: `class User {\n  constructor(name) {\n    this.name = name;\n    this.email = null;\n  }\n}`
    },
    regressionTests: [
      // THE FIX IS HERE: JS now converts null to the string "None"
      { testCode: { python: `u = User("A")\nu.setEmail("invalid-email")\nprint(u.email)`, javascript: `const u = new User("A"); u.setEmail("invalid-email"); console.log(u.email === null ? 'None' : u.email);` }, expected_output: "None" }
    ],
    featureTests: [
      { testCode: { python: `u = User("B")\nu.setEmail("test@example.com")\nprint(u.email)`, javascript: `const u = new User("B"); u.setEmail("test@example.com"); console.log(u.email);` }, expected_output: "test@example.com" }
    ]
  },

  {
    id: "regression-5",
    mode: "regression",
    title: "Admin Toggle Feature",
    description: "Add `makeAdmin()` and `revokeAdmin()` methods to toggle the `isAdmin` boolean property.",
    difficulty: "hard",
    minLevel: 5,
    xpReward: 200,
    starterCode: { python: `class User:\n    def __init__(self, name):\n        self.name = name\n        self.is_admin = False`, javascript: `class User {\n  constructor(name) {\n    this.name = name;\n    this.isAdmin = false;\n  }\n}` },
    regressionTests: [ { testCode: { python: `u = User("A")\nprint(u.is_admin)`, javascript: `const u = new User("A"); console.log(u.isAdmin ? 'True' : 'False');` }, expected_output: "False" } ],
    featureTests: [ { testCode: { python: `u = User("B")\nu.makeAdmin()\nprint(u.is_admin)`, javascript: `const u = new User("B"); u.makeAdmin(); console.log(u.isAdmin ? 'True' : 'False');` }, expected_output: "True" } ]
  },

  // ==========================================================
  // OPTIMIZER MODE (5 Levels: 1 Easy, 2 Medium, 2 Hard)
  // ==========================================================
   { // --- THIS IS THE NEW LEVEL 1 ---
    id: "optimizer-1",
    mode: "optimizer",
    title: "Fast Sum of a Range",
    description: "This function calculates the sum of all numbers from 1 to n using a loop. A famous mathematical formula can do this instantly without any loops.",
    difficulty: "easy",
    minLevel: 1,
    xpReward: 100,
    variants: {
      python: [`def sum_range(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total`],
      javascript: [`function sumRange(n) {\n    let total = 0;\n    for (let i = 1; i <= n; i++) {\n        total += i;\n    }\n    return total;\n}`]
    },
    callCode: {
      python: `n = int(input().strip())\nprint(sum_range(n))`,
      javascript: `const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim(), 10);\nconsole.log(sumRange(n));`
    },
    tests: [ { input: "100", expected_output: "5050" } ],
    antiPattern: { python: 'for i in range', javascript: 'for (' }
  },

  {
    id: "optimizer-2",
    mode: "optimizer",
    title: "Optimize Unique Elements",
    description: "This function finds unique elements by repeatedly searching a list, which is slow (O(n²)). Use a faster data structure for lookups.",
    difficulty: "medium",
    minLevel: 2,
    xpReward: 150,
    variants: { python: [`def unique_elements(lst):\n    uniques = []\n    for x in lst:\n        if x not in uniques:\n            uniques.append(x)\n    return sorted(uniques)`], javascript: [`function uniqueElements(arr) {\n    const uniques = [];\n    for (const x of arr) {\n        if (!uniques.includes(x)) {\n            uniques.push(x);\n        }\n    }\n    return uniques.sort();\n}`] },
    callCode: { python: `import sys\nlst = sys.stdin.read().strip().split()\nprint(" ".join(map(str, unique_elements(lst))))`, javascript: `const fs = require('fs');\nconst arr = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\nconsole.log(uniqueElements(arr).join(' '));` },
    tests: [ { input: "1 2 2 3 1 4", expected_output: "1 2 3 4" } ],
    antiPattern: { python: 'not in uniques', javascript: '.includes(' } // NEW PROPERTY
  },
  {
    id: "optimizer-3",
    mode: "optimizer",
    title: "Optimize Min Finder",
    description: "This function finds the minimum element by first sorting the entire list, which is unnecessary work. Find it in a single pass.",
    difficulty: "medium",
    minLevel: 3,
    xpReward: 150,
    variants: { python: [`def find_min(lst):\n    lst_sorted = sorted(lst)\n    return lst_sorted[0]`], javascript: [`function findMin(arr) {\n    arr.sort((a,b) => a-b);\n    return arr[0];\n}`] },
    callCode: { python: `import sys\nlst = list(map(int, sys.stdin.read().strip().split()))\nprint(find_min(lst))`, javascript: `const fs = require('fs');\nconst arr = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(findMin(arr));` },
    tests: [ { input: "5 3 8 2 9", expected_output: "2" } ],
    antiPattern: { python: 'sorted(', javascript: '.sort(' } // NEW PROPERTY
  },
  {
    id: "optimizer-4",
    mode: "optimizer",
    title: "Optimize Prime Checker",
    description: "This function checks for prime numbers by testing divisibility all the way up to `num`. You only need to check up to the square root of `num`.",
    difficulty: "hard",
    minLevel: 4,
    xpReward: 200,
    variants: { python: [`def is_prime(num):\n    if num < 2:\n        return False\n    for i in range(2, num):\n        if num % i == 0:\n            return False\n    return True`], javascript: [`function isPrime(num) {\n  if (num < 2) return false;\n  for(let i = 2; i < num; i++) {\n    if (num % i === 0) return false;\n  }\n  return true;\n}`] },
    callCode: { python: `n = int(input().strip())\nprint(is_prime(n))`, javascript: `const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim(), 10);\nconst result = isPrime(n);\nconsole.log(result ? 'True' : 'False');` },
    tests: [ { input: "97", expected_output: "True" }, { input: "100", expected_output: "False" } ],
    antiPattern: { python: 'range(2, num)', javascript: 'i < num' } // NEW PROPERTY
  },
  {
    id: "optimizer-5",
    mode: "optimizer",
    title: "Optimize Fibonacci",
    description: "This recursive Fibonacci function is elegant but extremely slow due to repeated calculations. Optimize it using memoization or an iterative approach.",
    difficulty: "hard",
    minLevel: 5,
    xpReward: 200,
    variants: { python: [`def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)`], javascript: [`function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}`] },
    callCode: { python: `n = int(input().strip())\nprint(fibonacci(n))`, javascript: `const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim(), 10);\nconsole.log(fibonacci(n));` },
    tests: [ { input: "10", expected_output: "55" }, { input: "20", expected_output: "6765" } ],
    antiPattern: { python: 'fibonacci(n-1)', javascript: 'fibonacci(n - 1)' } // NEW PROPERTY
  }
];