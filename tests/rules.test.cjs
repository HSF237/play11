const fs = require("fs");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const { doc, setDoc, getDoc, serverTimestamp } = require("firebase/firestore");
(async () => {
  const env = await initializeTestEnvironment({
    projectId: "demo-play11",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });
  const guest = env.unauthenticatedContext().firestore();
  const admin = env
    .authenticatedContext("admin", {
      email: "play11official@gmail.com",
      email_verified: true,
    })
    .firestore();
  const unverified = env
    .authenticatedContext("bad", {
      email: "play11official@gmail.com",
      email_verified: false,
    })
    .firestore();
  const other = env
    .authenticatedContext("other", {
      email: "other@example.com",
      email_verified: true,
    })
    .firestore();
  const data = {
    form: {
      name: "Test",
      phone: "9876543210",
      email: "",
      address: "Test address",
      city: "Kochi",
      state: "Kerala",
      pincode: "682001",
      country: "India",
    },
    items: [{ id: "p1", name: "Jersey", size: "M", qty: 1, price: 349 }],
    subtotal: 349,
    discount: 0,
    total: 349,
    deliveryCharge: null,
    couponCode: "",
    userId: "",
    isMock: false,
    source: "whatsapp",
    consent: true,
    status: "requested",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
  };
  let count = 0;
  async function ok(p) {
    await assertSucceeds(p);
    count++;
  }
  async function no(p) {
    await assertFails(p);
    count++;
  }
  await ok(setDoc(doc(guest, "orderRequests", "valid"), data));
  await ok(
    setDoc(doc(guest, "orderRequests", "ten"), {
      ...data,
      items: Array.from({ length: 10 }, (_, i) => ({
        ...data.items[0],
        id: "p" + i,
      })),
    }),
  );
  await no(getDoc(doc(guest, "orderRequests", "valid")));
  await ok(getDoc(doc(admin, "orderRequests", "valid")));
  await no(getDoc(doc(other, "orderRequests", "valid")));
  await no(getDoc(doc(unverified, "orderRequests", "valid")));
  for (const [key, val] of [
    ["status", "confirmed"],
    ["paymentStatus", "paid"],
    ["consent", false],
    ["total", 1],
    ["userId", "spoof"],
  ])
    await no(setDoc(doc(guest, "orderRequests", key), { ...data, [key]: val }));
  await no(
    setDoc(doc(guest, "orderRequests", "line"), {
      ...data,
      items: [...data.items, { ...data.items[0], qty: 100 }],
    }),
  );
  await no(
    setDoc(doc(guest, "products", "p1"), {
      name: "Jersey",
      price: 349,
      sizes: ["M"],
      stock: 5,
    }),
  );
  await ok(
    setDoc(doc(admin, "products", "p1"), {
      name: "Jersey",
      price: 349,
      sizes: ["M"],
      stock: 5,
    }),
  );
  await no(setDoc(doc(unverified, "settings", "store"), { title: "bad" }));
  await ok(setDoc(doc(admin, "settings", "store"), { title: "PLAY11" }));
  await no(setDoc(doc(guest, "orders", "legacy"), data));
  await ok(getDoc(doc(guest, "products", "p1")));
  await env.cleanup();
  console.log(count + " Firebase security assertions passed");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
