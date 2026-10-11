# PLAY11 backend setup

The website uses the existing Firebase project `play11-ed7b4`. No real products or order history are overwritten by the rebuild.

## Required before opening for orders

1. Open Firebase Console → Firestore Database → Rules. Replace the rules with the repository’s `firestore.rules` and Publish. Alternatively sign in locally with Firebase CLI and run `firebase deploy --only firestore:rules --project play11-ed7b4`.
2. Authentication → Settings → Authorised domains: ensure your actual Vercel domain is allowed. Google and email/password providers must be enabled for staff sign-in.
3. Sign in at `/admin` using a verified account in `ADMIN_EMAILS`. The same allowlist is enforced in Firestore rules. Changing staff access requires updating both the allowlist and rules.
4. Add real products with accurate photos, prices, available sizes, fabric and size measurements. Review existing products before publishing them.
5. In Store settings, confirm delivery and return policies, then disable Show sample catalogue.

## Order flow

A guest saves an unpaid order request in `orderRequests`, then explicitly opens WhatsApp and sends the prepared message. Saving a request never claims payment or stock confirmation. The staff confirms current prices and stock using a Firestore transaction; it reserves stock atomically. Staff verifies payment independently, adds tracking, marks shipped and delivered. Cancellation restores reserved stock. Sample products cannot be confirmed for fulfilment. Legacy orders remain visible in Legacy history.

Below the free-delivery threshold, shipping is quoted on WhatsApp unless a fixed fee is set. Free delivery applies above the threshold after discounts. Orders contain up to 10 jersey/size combinations with up to 20 pieces each. Bulk enquiries can be handled on WhatsApp.

## Security and operations

Firebase web configuration is public identification, not administrator credentials. Never put a service-account private key in the frontend or repository. Customer records are staff-only. Submitted totals are estimates, recalculated at admin confirmation. Anonymous request creation is allowed; monitor abuse and configure Firebase App Check before a public marketing campaign. Configure project quotas/alerts and retain order records according to your published privacy policy.

Publishing this GitHub code to Vercel does not publish Firebase database rules. Do not describe the database controls as live until the rules have been published and staff access has been tested.
