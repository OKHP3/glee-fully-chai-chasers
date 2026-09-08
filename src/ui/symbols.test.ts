import { describe, expect, it } from "vitest";
import { fireflyJarSvg } from "./symbols";

describe("fireflyJarSvg", () => {
  it.each([
    [-1, 0],
    [0, 0],
    [5, 5],
    [6, 6],
    [7, 6],
    [8, 6],
  ])("clamps %s to %s visible fireflies", (input, expected) => {
    const markup = fireflyJarSvg(input);
    expect((markup.match(/class="jar-firefly"/g) ?? [])).toHaveLength(expected);
  });
});