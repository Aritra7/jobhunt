import { describe, expect, it } from "vitest";
import { readStored } from "./useLocalStorage";

describe("readStored", () => {
  it("returns the default when nothing is stored", () => {
    expect(readStored("k", { a: 1 })).toEqual({ a: 1 });
  });

  it("fills fields missing from older saved objects with defaults", () => {
    localStorage.setItem("k", JSON.stringify({ a: 5 }));
    expect(readStored("k", { a: 1, b: [] })).toEqual({ a: 5, b: [] });
  });

  it("ignores corrupt JSON and values of the wrong shape", () => {
    localStorage.setItem("bad", "{not json");
    expect(readStored("bad", [])).toEqual([]);
    localStorage.setItem("arr", JSON.stringify({ not: "an array" }));
    expect(readStored("arr", [])).toEqual([]);
    localStorage.setItem("obj", JSON.stringify([1, 2]));
    expect(readStored("obj", { a: 1 })).toEqual({ a: 1 });
  });

  it("returns stored arrays and records as-is", () => {
    localStorage.setItem("ids", JSON.stringify([3, 4]));
    expect(readStored("ids", [])).toEqual([3, 4]);
  });
});
