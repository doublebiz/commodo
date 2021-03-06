# @commodo/name
Creates a new function with a name assigned to it and passed to its instances.

## Usage

```js
import { withName } from "@commodo/name";
import { compose } from "ramda";

// Create two functions with a name assigned to them.
const User = compose(
  withName("User"),
  (...)
)(function() {});

const Company = compose(
  withName("Company"),
  (...)
)(function() {});
```

Additionaly, use `hasName` function to determine if a function or an instance of it has a name and, when needed, `getName` function get the actual value.

```js
import { withName, hasName, getName } from "@commodo/name";
import { compose } from "ramda";

// Create two functions - only second one with a name.
const Unknown = function() {};
const User = compose(
  withName("User"),
  (...)
)(function() {});

// The Unknown function doesn't have a name assigned.
console.log(hasName(Unknown)); // false
console.log(getName(Unknown)); // ""

console.log(hasName(User)); // true
console.log(getName(User)); // "User"

// Also works on an instance of a function.
const user = new User();

console.log(hasName(user)); // true
console.log(getName(user)); // "User"
```

## Reference

#### `withName(name: string): Function`
Creates a new function with a name assigned to it and passed to its instances.

#### `hasName(value: any): boolean`
Checks if passed value has a name assigned to it.

#### `getName(value: any): string`
Returns a name assigned to the passed value. Returns empty string if none assigned.
