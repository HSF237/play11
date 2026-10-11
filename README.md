# PLAY11

Football jersey storefront with a responsive sports editorial design, WhatsApp order requests and Firebase-backed staff controls.

## Run

```sh
npm ci
npm run dev
npm run build
```

## Pages

Home, catalogue with search/filters/sorting, product galleries and sizing, persistent bag, wishlist, WhatsApp checkout, story, help, policies and staff admin.

The admin manages products, stock, sizes, prices, photos, featured products, order requests, payment verification, tracking, coupons, homepage content, collections, delivery and policies.

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for the required database-rule publication and launch settings. The sample collection is explicitly labelled and can be replaced through the admin.

## Checks

Run `npm test` for commerce regression checks. With Java 17 installed, run `npx firebase-tools@13.35.1 emulators:exec --only firestore --project demo-play11 "node tests/rules.test.cjs"` for database permission and request validation tests. These tests use an isolated demo project, never live customer data.
