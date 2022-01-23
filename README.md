# NamedBits

![run tests](https://github.com/AlexanderBeyn/namedbits/actions/workflows/test.yml/badge.svg)

`namedbits` is a TypeScript/JavaScript library implementing a bit field, with named bits for easier access.

## Installation

Install `namedbits` into an existing project:

```bash
# npm
npm install --save namedbits
```

## Usage

```typescript
import { NamedBits } from "namedbits";

// create new bit field
const bits = new NamedBits(["aa", "bb", "cc"] as const);

// set a bit
bits.set("bb");

// get a bit
bits.get("bb");
// true

// get the bit field as a number
bits.toNumber();
// 2

// convert to JSON
JSON.stringify({ bits });
// '{"bits":"2"}'

// convert to JSON as an array
bits.setOptions({json: "array"});
JSON.stringify({ bits });
// '{"bits":["bb"]}'

// try to use an invalid field name
// this relies on "as const" when creating the bit field
bits.set("omega");
// <repl>.ts:10:10 - error TS2345: Argument of type '"omega"' is not assignable to parameter of type '"aa" | "bb" | "cc"'.
// 
// 10 bits.set("omega");
//             ~~~~~~~
```

## Documentation

### new NamedBits(names, options)
Creates a new bit field

**Params**
- `names` - array of strings
  - The names of bits, starting at the first. Pass a constant array (e.g.: `["aa", "bb", "cc"] as const` ) to have the names be type checked.
- `options` - object
  - see `NamedBits#setOptions(options)`

### NamedBits#get(name)
Returns the value of a bit identified by the name

### NamedBits#set(name, value = true)
Sets the value of a bit, to `true` by default

### NamedBits#clear(name)
Clears the value of a bit. Identical to `.set(name, false)`

### NamedBits#toggle(name)
Toggles the value of a bit


### NamedBits#setAll()
Sets all bits to `true`


### NamedBits#clearAll()
Sets all bits to `false`


### NamedBits#setOptions(options)
Customizes bit field's behavior 
**Params**
- `options` - object
  - `options.json` - "string_list" | "string_bigint" | "array" | "number"
    - Changes the way the bit field is serialized by `JSON.stringify()`
    - `string_list` - list of set field names, separated by a comma
    - `string_bigint` - value of the bit field as a bigint, converted to a string
    - `array` - JSON array of set bit names
    - `number` - value of the bit field as a number
      - Note, this will throw an exception if there are more than 53 bits, since JavaScript's number type cannot safely handle integers larger than 2^53.


### NamedBits#toArray()
Returns a list set bit names as an array of strings

### NamedBits#toNumber()
Returns the value of the bit field as a `number`.

Note, this will throw an exception if there are more than 53 bits, since JavaScript's number type cannot safely handle integers larger than 2^53.


### NamedBits#toBigInt()
Returns the value of the bit field as a `bignum`


### NamedBits#toString()
Returns a list of set bit names separated by a comma


### NamedBits#toJSON()
Helper method for `JSON.stringify()`, configured by `options.json`



## License
[MIT](https://choosealicense.com/licenses/mit/)
