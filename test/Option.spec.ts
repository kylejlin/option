import Option from "../src/index";

test("Option.some()", () => {
  Option.some(42);
  Option.some("foo");
  Option.some({});
  Option.some([]);
  Option.some(null);
  Option.some(undefined);
});

test("Option.none()", () => {
  Option.none();
});

test("Option.none() === Option.none()", () => {
  expect(Option.none()).toBe(Option.none());
});

test("Option.all()", () => {
  const a = Option.some("foo");
  const b = Option.none();
  const c = Option.some(42);
  const d = Option.some(null);

  const abcd = Option.all([a, b, c, d]);
  expect(abcd.isNone()).toBe(true);

  const acd = Option.all([a, c, d]);
  expect(acd.isSome()).toBe(true);
  expect(acd.unwrap()).toEqual(["foo", 42, null]);
});

test("Option.prototype.isSome()", () => {
  [
    Option.some(42),
    Option.some("foo"),
    Option.some({}),
    Option.some([]),
    Option.some(null),
    Option.some(undefined),
  ].forEach(o => {
    expect(o.isSome()).toBe(true);
  });

  expect(Option.none().isSome()).toBe(false);
});

test("Option.prototype.isNone()", () => {
  [
    Option.some(42),
    Option.some("foo"),
    Option.some({}),
    Option.some([]),
    Option.some(null),
    Option.some(undefined),
  ].forEach(o => {
    expect(o.isNone()).toBe(false);
  });

  expect(Option.none().isNone()).toBe(true);
});

test("Option.prototype.match() calls correct callback", () => {
  function getMatcher() {
    return {
      none: jest.fn(() => -1),
      some: jest.fn(x => x.toUpperCase()),
    };
  }

  const matcher1 = getMatcher();
  expect(Option.some("foo").match(matcher1)).toBe("FOO");
  expect(matcher1.some.mock.calls.length).toBe(1);
  expect(matcher1.some.mock.calls[0]).toEqual(["foo"]);
  expect(matcher1.none.mock.calls.length).toBe(0);

  const matcher2 = getMatcher();
  expect(Option.none().match(matcher2)).toBe(-1);
  expect(matcher2.none.mock.calls.length).toBe(1);
  expect(matcher2.none.mock.calls[0]).toEqual([]);
  expect(matcher2.some.mock.calls.length).toBe(0);
});

test("Option.prototype.map() only calls callback if `this` is some", () => {
  const mapper1 = jest.fn(x => x * 3);
  expect(
    Option.some(4)
      .map(mapper1)
      .unwrap(),
  ).toBe(12);
  expect(mapper1.mock.calls[0]).toEqual([4]);

  const mapper2 = jest.fn(x => x * 3);
  expect(
    Option.none()
      .map(mapper2)
      .isNone(),
  ).toBe(true);
  expect(mapper2.mock.calls.length).toBe(0);
});

test("Option.prototype.ifSome() only calls callback if `this` is some", () => {
  const callback1 = jest.fn(() => {});
  Option.some("foo").ifSome(callback1);
  expect(callback1.mock.calls[0]).toEqual(["foo"]);

  const callback2 = jest.fn(() => {});
  Option.none().ifSome(callback2);
  expect(callback2.mock.calls.length).toBe(0);
});

test("Option.prototype.ifNone() only calls callback if `this` is none", () => {
  const callback1 = jest.fn(() => {});
  Option.some("foo").ifNone(callback1);
  expect(callback1.mock.calls.length).toBe(0);

  const callback2 = jest.fn(() => {});
  Option.none().ifNone(callback2);
  expect(callback2.mock.calls.length).toBe(1);
});

test("Option.prototype.unwrap() returns wrapped value if `this` is some", () => {
  expect(Option.some("foo").unwrap()).toBe("foo");
});

test("Option.prototype.unwrap() throws an UnwrapError with the correct message if `this` is none", () => {
  // `expect(...).toThrowError(expectedErr)` doesn't check if
  //     actualErr.name == expectedErr.name.
  //     Hence, we must manually verify this.
  let error: Error | undefined;
  try {
    Option.none().unwrap();
  } catch (e) {
    error = e;
  }
  expect(error).not.toBe(undefined);
  expect(error!.name).toBe("UnwrapError");
  expect(error!.message).toBe("Tried to call unwrap() on Option.none()");
});

test("Option.prototype.expect() returns wrapped value if `this` is some", () => {
  expect(Option.some("foo").expect("Oh noes!")).toBe("foo");
});

test("Option.prototype.expect() throws the provided error message wrapped in an UnwrapError if the message is a string", () => {
  // `expect(...).toThrowError(expectedErr)` doesn't check if
  //     actualErr.name == expectedErr.name.
  //     Hence, we must manually verify this.
  let error: Error | undefined;
  try {
    Option.none().expect("Oh noes!");
  } catch (e) {
    error = e;
  }
  expect(error).not.toBe(undefined);
  expect(error!.name).toBe("UnwrapError");
  expect(error!.message).toBe("Oh noes!");
});

test("Option.prototype.expect() throws the provided error as is if it is an instance of Error", () => {
  // `expect(...).toThrowError(expectedErr)` doesn't use ===
  //     to compared actualErr against expectedErr
  //     Hence, we must manually verify this.
  const providedError = new Error("Oh noes!");
  let actualError: Error | undefined;
  try {
    Option.none().expect(providedError);
  } catch (e) {
    actualError = e;
  }
  expect(actualError).toBe(providedError);
});

test("Option.prototype.unwrapOr() returns wrapped value if `this` is some", () => {
  expect(Option.some(42).unwrapOr(-19)).toBe(42);
});

test("Option.prototype.unwrapOr() returns the provided default value if `this` is none", () => {
  expect(Option.none().unwrapOr(-19)).toBe(-19);
});

test("Option.prototype.unwrapOrElse() only calls the provided thunk if `this` is none", () => {
  const thunk1 = jest.fn(() => -19);
  expect(Option.some(42).unwrapOrElse(thunk1)).toBe(42);
  expect(thunk1.mock.calls.length).toBe(0);

  const thunk2 = jest.fn(() => -19);
  expect(Option.none().unwrapOrElse(thunk2)).toBe(-19);
  expect(thunk2.mock.calls.length).toBe(1);
});

test("Option.prototype.andThen() only calls the provided flat mapper if `this` is some", () => {
  const firstChar = jest.fn(
    (s: string): Option<string> => {
      return s.length === 0 ? Option.none() : Option.some(s.charAt(0));
    },
  );

  expect(Option.none<string>().andThen(firstChar)).toEqual(Option.none());
  expect(firstChar.mock.calls.length).toBe(0);
  expect(Option.some("foo").andThen(firstChar)).toEqual(Option.some("f"));
  expect(firstChar.mock.calls).toEqual([["foo"]]);
  expect(Option.some("").andThen(firstChar)).toEqual(Option.none());
  expect(firstChar.mock.calls).toEqual([["foo"], [""]]);
});
