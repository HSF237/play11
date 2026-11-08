import fs from "node:fs";
import path from "node:path";
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

const suppliedJerseys = JSON.parse(
  fs.readFileSync("src/new/userJerseys.json", "utf8"),
);
assert.equal(suppliedJerseys.length, 21);
assert.equal(new Set(suppliedJerseys.map((product) => product.id)).size, 21);
assert.ok(suppliedJerseys.every((product) => product.price === 249));
assert.ok(
  suppliedJerseys.every((product) =>
    product.images.every((image) =>
      fs.existsSync(
        path.join(
          "public",
          image.replace(/^\/+/, "").replaceAll("/", path.sep),
        ),
      ),
    ),
  ),
);
const productById = new Map(
  suppliedJerseys.map((product) => [product.id, product]),
);
assert.deepEqual(
  productById.get("provided-j022").images,
  [
    "/products/user-collection/j022-front.jpg",
    "/products/user-collection/j018-back.jpg",
    "/products/user-collection/j022-model.jpg",
  ],
);
assert.deepEqual(
  productById.get("provided-j023").images,
  [
    "/products/user-collection/j023-front.jpg",
    "/products/user-collection/j019-back.jpg",
    "/products/user-collection/j023-model.jpg",
  ],
);
assert.deepEqual(
  productById.get("provided-j020").images,
  [
    "/products/user-collection/j020-front.jpg",
    "/products/user-collection/j021-back.jpg",
    "/products/user-collection/j020-model.jpg",
  ],
);
assert.deepEqual(
  productById.get("provided-j015").images,
  [
    "/products/user-collection/j015-front.jpg",
    "/products/user-collection/j014-back.jpg",
    "/products/user-collection/j015-model.jpg",
  ],
);
assert.deepEqual(
  productById.get("provided-j013").images,
  [
    "/products/user-collection/j013-front.jpg",
    "/products/user-collection/j012-back.jpg",
    "/products/user-collection/j013-model.jpg",
  ],
);
for (const duplicateId of [12, 14, 18, 19, 21]) {
  assert.equal(productById.has(`provided-j${duplicateId}`), false);
}
console.log(
  "9 supplied jersey checks passed: 21 unique products, all priced at ₹249, all referenced photos exist, five split front/back pairs are merged.",
);

// Live inventory must never be hidden by the sample setting.
const { catalogueState } = await import("../src/new/catalogue.js");
const preview = [{ id: "sample" }];
const live = [{ id: "france", published: true }, { id: "psg", published: true }, { id: "draft", published: false }];
assert.deepEqual(catalogueState(live, preview, true).products.map(p => p.id), ["france", "psg"]);
assert.equal(catalogueState(live, preview, true).isSampleCatalogue, false);
assert.deepEqual(catalogueState(live, preview, false).products.map(p => p.id), ["france", "psg"]);
assert.equal(catalogueState([], preview, true).isSampleCatalogue, true);
assert.deepEqual(catalogueState([], preview, false).products, []);
assert.deepEqual(catalogueState(live.slice(2), preview, true).products, preview);
assert.deepEqual(catalogueState([], preview, true, true).products, []);
assert.deepEqual(catalogueState([], preview, true, false, "Permission denied").products, []);
assert.equal(catalogueState([{id: "legacy"}], preview, true).products[0].id, "legacy");
console.log("9 catalogue checks passed: live products override samples, drafts stay hidden, samples are an empty-catalogue fallback, loading and errors stay visible.");
