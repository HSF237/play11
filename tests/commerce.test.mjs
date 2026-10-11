import fs from "node:fs";
import assert from "node:assert/strict";
import { transform } from "esbuild";
const source = fs.readFileSync("src/new/core.jsx", "utf8");
const functions = source.slice(
  source.indexOf("export function discountFor"),
  source.indexOf("export async function coupons"),
);
const { code } = await transform(functions, { loader: "js", format: "esm" });
const { discountFor, reconcile } = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);
const items = [
  { id: "a", name: "A", price: 400, qty: 2, size: "M" },
  { id: "b", name: "B", price: 500, qty: 1, size: "L" },
];
assert.equal(
  discountFor(items, {
    discountType: "percentage",
    discountValue: 10,
    applicableProduct: "all",
  }),
  130,
);
assert.equal(
  discountFor(items, {
    discountType: "percent",
    discountValue: 10,
    applicableProduct: "a",
  }),
  80,
);
assert.equal(
  discountFor(items, {
    discountType: "flat",
    discountValue: 9999,
    applicableProduct: "a",
  }),
  800,
);
assert.equal(
  discountFor(items, {
    discountType: "percentage",
    discountValue: 100,
    maxDiscount: 100,
  }),
  100,
);
assert.equal(
  discountFor(items, {
    discountType: "flat",
    discountValue: 10,
    validity: "2020-01-01",
  }),
  0,
);
assert.equal(
  discountFor(items, {
    discountType: "flat",
    discountValue: 10,
    minSpend: 1500,
  }),
  0,
);
assert.equal(
  discountFor(items, {
    discountType: "flat",
    discountValue: 10,
    active: false,
  }),
  0,
);
assert.throws(
  () =>
    reconcile(items, [
      { id: "a", name: "A", price: 400, sizes: ["M"], stock: 1 },
    ]),
  /only 1/,
);
assert.throws(
  () =>
    reconcile(items, [
      { id: "a", name: "A", price: 400, sizes: ["S"], stock: 3 },
    ]),
  /size M/,
);
assert.throws(() => reconcile(items, []), /unavailable/);
const result = reconcile(items, [
  { id: "a", name: "A", price: 450, sizes: ["M"], stock: 3 },
  { id: "b", name: "B", price: 500, sizes: ["L"], stock: 2 },
]);
assert.equal(result[0].price, 450);
const delivery = source.match(/export const deliveryFor\s*=([\s\S]*?);/)[1];
const deliver = Function(
  "defaults",
  `return (${delivery})`,
)({ freeShippingThreshold: 999, deliveryCharge: null });
assert.equal(deliver(999), null);
assert.equal(deliver(1000), 0);
assert.equal(
  deliver(500, { freeShippingThreshold: 999, deliveryCharge: 60 }),
  60,
);
console.log(
  "14 commerce checks passed: coupon types, scope, caps, expiry, minimum spend, disabled coupon, stock, size, current price, delivery boundary.",
);
