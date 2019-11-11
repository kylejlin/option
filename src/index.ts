export default class Option<T> {
  /**
   * Returns a `some` variant that wraps the provided value.
   * Corresponds to Rust's `Option::<T>::Some(T)`.
   * @param value The value to be wrapped.
   */
  static some<T>(value: T): Option<T> {
    const some = Object.create(Option.prototype);
    some.isNone_ = false;
    some.value = value;
    return some;
  }

  /**
   * Returns the `none` variant.
   * Corresponds to Rust's `Option::None`.
   */
  static none<T>(): Option<T> {
    return NONE;
  }

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

  static all<T>(options: Option<T>[]): Option<T[]> {
    let values = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option.isSome()) {
        values.push((option as any).value);
      } else {
        return Option.none();
      }
    }
    return Option.some(values);
  }

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
  match<N, S>(matcher: { none: () => N; some: (value: T) => S }): N | S {
    if (this.isNone()) {
      return matcher.none();
    } else {
      return matcher.some((this as any).value);
    }
  }

  isNone(): boolean {
    return (this as any).isNone_;
  }

  isSome(): boolean {
    return !this.isNone();
  }

  /**
   * Returns `Option.none()` if `this` is `none`,
   * and `Option.some(mapper(x))` where `x` is
   * the value `this` wraps.
   *
   * @param mapper A function that will be called if `this` is `some`.
   */
  map<R>(mapper: (value: T) => R): Option<R> {
    return this.match({
      none: () => (this as unknown) as Option<R>,
      some: value => Option.some(mapper(value)),
    });
  }

  /**
   * Calls the provided callback if `this` is `some`.
   * This method is the same as `Option.prototype.map()`
   * except that it discards the value returned by
   * the callback, unconditionally returning undefined.
   *
   * @param executor A callback that will be called if `this` is `some`.
   */
  ifSome(executor: (value: T) => void): void {
    this.map(executor);
  }

  /**
   * Calls the provided callback if `this` is `none`.
   *
   * @param executor A callback that will be called if `this` is `none`.
   */
  ifNone(executor: () => void): void {
    if (this.isNone()) {
      executor();
    }
  }

  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise throwing an `UnwrapError`.
   */
  unwrap(): T {
    return this.expect("Tried to call unwrap() on Option.none()");
  }

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
  expect(message: string | Error): T {
    return this.match({
      none: () => {
        const error =
          "string" === typeof message ? new UnwrapError(message) : message;
        throw error;
      },
      some: value => value,
    });
  }

  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise returning the provided default.
   *
   * @param defaultValue The value to return if `this` is `none`.
   */
  unwrapOr<D>(defaultValue: D): T | D {
    return this.match({
      none: () => defaultValue,
      some: value => value,
    });
  }

  /**
   * Returns the wrapped value if `this` is `some`,
   * otherwise calling the provided thunk and returning its return value.
   *
   * The thunk is called lazily (i.e., if `this` is `some`, the thunk
   * will never be called because there is no need for a default value).
   *
   * @param defaultValueThunk A callback that returns the value to return if `this` is `none`.
   */
  unwrapOrElse<D>(defaultValueThunk: () => D): T | D {
    return this.match({
      none: () => defaultValueThunk(),
      some: value => value,
    });
  }

  /**
   * Returns `Option.none()` if `this` is `none`,
   * otherwise calling the provided callback with the wrapped value,
   * returning its return value.
   *
   * @param flatMapper A function that returns an `Option` to return if `this` is `some`.
   */
  andThen<U>(flatMapper: (value: T) => Option<U>): Option<U> {
    return this.match({
      none: () => Option.none(),
      some: flatMapper,
    });
  }
}

const NONE = (() => {
  const none = Object.create(Option.prototype);
  none.isNone_ = true;
  return none;
})();

/**
 * An error that occurs when `unwrap()` or `expect()`
 * is called on `Option.none()`.
 */
export class UnwrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnwrapError";
  }
}
