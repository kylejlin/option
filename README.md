# Option

[![Build Status](https://travis-ci.com/kylejlin/option.svg?branch=master)](https://travis-ci.com/kylejlin/option)
[![Coverage Status](https://coveralls.io/repos/github/kylejlin/option/badge.svg?branch=master)](https://coveralls.io/github/kylejlin/option?branch=master)
[![npm version](https://badge.fury.io/js/%40kylejlin%2Foption.svg)](https://www.npmjs.com/package/@kylejlin/option)
[![Downloads](https://img.shields.io/npm/dm/%40kylejlin%2Foption.svg)](https://www.npmjs.com/package/@kylejlin/option)

A [Rust-inspired](https://doc.rust-lang.org/std/option/enum.Option.html) `Option` type for TypeScript.

## Usage

```bash
npm install --save @kylejlin/option
```

```ts
import { Option, option } from "@kylejlin/option";

const a = option.some("foo");
const b = a.map(x => x.toUpperCase());

const c = option.some(3);
const d = a.andThen(a => c.map(c => a.repeat(c)));

function f(opt: Option<string>) {
  console.log(opt.unwrap());
}

// Logs "FOOFOOFOO"
f(d);
```

### Why `Option` _and_ `option`?

`Option` is just an interface—any `Option`-compatible code you write will be compatible with any implementation of `Option`.
This gives you the flexibility to implement `Option` however you like.

However, you probably don't want to write your own implementation, so we provide you with one out-of-the-box via the `option` factory object.
To instantiate a Some or None variant, simply call `option.some()` or `option.none()`, respectively.

## API Docs

Docs can be found [here](https://kylejlin.github.io/option/).

## Caveats

### Forgetting to import `Option` in a browser environment

_Note: You only have to worry about the following section if your tsconfig's `lib` includes `"dom"`._

If you reference `Option` but forget to import it from this package, this will likely be a silent error instead of the expected `Cannot find name 'Option'. (2304)`. This is because the browser declares [an `Option` constructor](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/Option) as part of its DOM API.
