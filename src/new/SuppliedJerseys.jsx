import { useRef, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "./core.jsx";
import jerseys from "./userJerseys.json";

const duplicateProductIds = [
  "provided-j012",
  "provided-j014",
  "provided-j018",
  "provided-j019",
  "provided-j021",
];
const productFields = [
  "name",
  "club",
  "type",
  "category",
  "sleeve",
  "price",
  "originalPrice",
  "sizes",
  "stock",
  "badge",
  "description",
  "fabric",
  "sizeChart",
  "images",
  "image",
  "available",
  "published",
  "featured",
  "isMock",
];
const sameProduct = (current, product) =>
  productFields.every(
    (field) => JSON.stringify(current[field]) === JSON.stringify(product[field]),
  );

export default function SuppliedJerseys() {
  const { isAdmin } = useAuth();
  const { liveProducts, notify, loading, error: catalogueError } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const liveById = new Map(liveProducts.map((product) => [product.id, product]));
  const productsToPublish = jerseys.filter((product) => {
    const current = liveById.get(product.id);
    return !current || !sameProduct(current, product);
  });
  const duplicatesToHide = duplicateProductIds.filter((id) => {
    const current = liveById.get(id);
    return current && (current.published !== false || current.available !== false);
  });
  const remaining = productsToPublish.length + duplicatesToHide.length;

  async function publish() {
    if (!isAdmin || running.current || loading || catalogueError) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      const created = await runTransaction(db, async (tx) => {
        const refs = jerseys.map((product) => doc(db, "products", product.id));
        const duplicateRefs = duplicateProductIds.map((id) =>
          doc(db, "products", id),
        );
        const snapshots = await Promise.all(
          [...refs, ...duplicateRefs].map((ref) => tx.get(ref)),
        );
        let count = 0;
        jerseys.forEach(({ id, ...product }, index) => {
          const current = snapshots[index];
          if (current.exists() && sameProduct(current.data(), product)) return;
          tx.set(refs[index], {
            ...product,
            createdAt: current.data()?.createdAt || serverTimestamp(),
          });
          count++;
        });
        duplicateRefs.forEach((ref, index) => {
          const current = snapshots[refs.length + index];
          if (
            !current.exists() ||
            (current.data().published === false &&
              current.data().available === false)
          )
            return;
          tx.set(ref, { published: false, available: false }, { merge: true });
          count++;
        });
        return count;
      });
      notify(`${created} supplied jersey catalogue updates applied.`);
    } catch (e) {
      setError(
        e.code === "permission-denied"
          ? "Your account cannot publish these jerseys. Check staff access and database rules."
          : "The supplied jerseys could not be published. Please retry.",
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  if (!isAdmin || remaining === 0) return null;
  return (
    <div className="notice" style={{ marginBottom: 24 }}>
      <b>Supplied jersey collection</b>
      <p>
        {jerseys.length} jerseys · ₹249 each · M, L, XL, XXL. Uses the supplied
        photos only; unavailable views are not generated. Confirm stock on
        WhatsApp before payment.
      </p>
      {catalogueError && (
        <p role="alert">
          The live catalogue must load before these products can be published.
        </p>
      )}
      <button
        className="btn btn-red"
        disabled={busy || loading || !!catalogueError}
        onClick={publish}
      >
        {busy
          ? "Updating jerseys…"
          : `Apply ${remaining} supplied jersey updates`}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
