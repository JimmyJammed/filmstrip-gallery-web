import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize } from "../src/types.ts";
const item = { id: "one", src: "/one.svg", alt: "A landscape" };
test("defaults preserve the six second film cadence", () => {
  const result = normalize({ items: [item] });
  assert.equal(result.secondsPerFrame, 6);
  assert.equal(result.direction, "left");
  assert.equal(result.autoplay, true);
});
test("caller-owned image records are copied", () => {
  const result = normalize({ items: [item] });
  result.items[0].alt = "changed";
  assert.equal(item.alt, "A landscape");
});
test("reject duplicate and empty identities", () => {
  assert.throws(() => normalize({ items: [item, item] }));
  assert.throws(() => normalize({ items: [{ ...item, id: "" }] }));
});
test("require source and descriptive field", () => {
  assert.throws(() => normalize({ items: [{ ...item, src: "" }] }));
  assert.throws(() => normalize({ items: [{ id: "a", src: "/a" }] }));
});
test("reject script URLs including full-size URLs", () => {
  assert.throws(() =>
    normalize({ items: [{ ...item, fullSrc: "javascript:alert(1)" }] }),
  );
});
test("clamp invalid motion and dimensions", () => {
  const result = normalize({
    items: [],
    secondsPerFrame: 0,
    frameHeight: Infinity,
    edgeFade: -2,
  });
  assert.equal(result.secondsPerFrame, 1);
  assert.equal(result.frameHeight, 240);
  assert.equal(result.edgeFade, 0);
});
