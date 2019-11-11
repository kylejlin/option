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
import Option from "@kylejlin/option";

const a = Option.some("foo");
const b = a.map(x => x.toUpperCase());

const c = Option.some(3);
const d = a.andThen(a => c.map(c => a.repeat(c)));

// Logs "FOOFOOFOO"
console.log(c.unwrap());
```

## Caveats

### Forgetting to import `Option` in a browser environment

_Note: You only have to worry about the following section if your tsconfig's `lib` includes `"dom"`._

If you reference `Option` but forget to import it from this package, this will likely be a silent error instead of the expected `Cannot find name 'Option'. (2304)`. This is because the browser declares [an `Option` constructor](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/Option) as part of its DOM API.

Hence, you may see some confusing error messages such as `Property 'some' does not exist on type 'new (text?: string | undefined, value?: string | undefined, defaultSelected?: boolean | undefined, selected?: boolean | undefined) => HTMLOptionElement'. (2339)` when you erroneously refer to the browser's `Option` instead of this package's `Option`.

## API

```ts
export default class Option<T> {
  /**
   * Returns a `some` variant that wraps the provided value.
   * Corresponds to Rust's `Option::<T>::Some(T)`.
   * @param value The value to be wrapped.
   */
  static some<T>(value: T): Option<T>;
  /**
   * Returns the `none` variant.
   * Corresponds to Rust's `Option::None`.
   */
  static none<T>(): Option<T>;
  /**
   * Transposes an array of options into an optional array,
   * analagous to how `Promise.all()` transposes
   * an array of promises into promised array.
   *
   * If every option is `some`, this method returns `Option.some(arr)`
   * where `arr` is an array of the unwrapped options.
   * Otherwise, this method returns `Option.none()`.
   *
   * @param options A tuple or array of options.
   */
  static all<A>(options: [Option<A>]): Option<[A]>;
  static all<A, B>(options: [Option<A>, Option<B>]): Option<[A, B]>;
  static all<A, B, C>(
    options: [Option<A>, Option<B>, Option<C>],
  ): Option<[A, B, C]>;
  static all<A, B, C, D>(
    options: [Option<A>, Option<B>, Option<C>, Option<D>],
  ): Option<[A, B, C, D]>;
  static all<A, B, C, D, E>(
    options: [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>],
  ): Option<[A, B, C, D, E]>;
  static all<A, B, C, D, E, F>(
    options: [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>, Option<F>],
  ): Option<[A, B, C, D, E, F]>;
  static all<A, B, C, D, E, F, G>(
    options: [
      Option<A>,
      Option<B>,
      Option<C>,
      Option<D>,
      Option<E>,
      Option<F>,
      Option<G>,
    ],
  ): Option<[A, B, C, D, E, F, G]>;
  static all<A, B, C, D, E, F, G, H>(
    options: [
      Option<A>,
      Option<B>,
      Option<C>,
      Option<D>,
      Option<E>,
      Option<F>,
      Option<G>,
      Option<H>,
    ],
  ): Option<[A, B, C, D, E, F, G, H]>;
  static all<T>(options: Option<T>[]): Option<T[]>;
  /**
   * Accepts an object with two callbacks.
   * One will be called if `this` is `none`.
   * The other will be called if `this` is `some`.
   *
   * Returns the return value of whichever callback
   * gets called.
   *
   * @param matcher An object with callbacks for `none` and `some`.
   */
  match<N, S>(matcher: { none: () => N; some: (value: T) => S }): N | S;
  isNone(): boolean;
  isSome(): boolean;
  /**
   * Returns `Option.none()` if `this` is `none`,
   * and `Option.some(mapper(x))` where `x` is
   * the value `this` wraps.
   *
   * @param mapper A function that will be called if `this` is `some`.
   */
  map<R>(mapper: (value: T) => R): Option<R>;
  /**
   * Calls the provided callback if `this` is `some`.
   * This method is the same as `Option.prototype.map()`
   * except that it discards the value returned by
   * the callback, unconditionally returning undefined.
   *
   * @param executor A callback that will be called if `this` is `some`.
   */
  ifSome(executor: (value: T) => void): void;
  /**
   * Calls the provided callback if `this` is `none`.
   *
   * @param executor A callback that will be called if `this` is `none`.
   */
  ifNone(executor: () => void): void;
  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise throwing an `UnwrapError`.
   */
  unwrap(): T;
  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise throwing an `UnwrapError` with the provided message.
   *
   * @param message The message of the `UnwrapError` to throw if `this` is `none`.
   */
  expect(message: string): T;
  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise throwing the provided error.
   *
   * @param error The error to throw if `this` is `none`.
   */
  expect(error: Error): T;
  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise returning the provided default.
   *
   * @param defaultValue The value to return if `this` is `none`.
   */
  unwrapOr<D>(defaultValue: D): T | D;
  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise calling the provided thunk and returning its return value.
   *
   * The thunk is called lazily (i.e., if `this` is `some`, the thunk
   * will never be called because there is no need for a default value).
   *
   * @param defaultValueThunk A callback that returns the value to return if `this` is `none`.
   */
  unwrapOrElse<D>(defaultValueThunk: () => D): T | D;
  /**
   * Returns `Option.none()` if `this` is `none`,
   * otherwise calling the provided callback with the wrapped value,
   * returning its return value.
   *
   * @param flatMapper A function that returns an `Option` to return if `this` is `some`.
   */
  andThen<U>(flatMapper: (value: T) => Option<U>): Option<U>;
}
/**
 * An error that occurs when `unwrap()` or `expect()`
 * is called on `Option.none()`.
 */
export declare class UnwrapError extends Error {
  constructor(message: string);
}
```
