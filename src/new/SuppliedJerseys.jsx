import { useRef, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "./core.jsx";
import jerseys from "./userJerseys.json";

export default function SuppliedJerseys() {
  const { isAdmin } = useAuth();
  const { liveProducts, notify, loading, error: catalogueError } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const existing = new Set(liveProducts.map((product) => product.id));
  const remaining = jerseys.filter((product) => !existing.has(product.id)).length;

  async function publish() {
    if (!isAdmin || running.current || loading || catalogueError) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      const created = await runTransaction(db, async (tx) => {
        const refs = jerseys.map((product) => doc(db, "products", product.id));
        const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
        let count = 0;
        jerseys.forEach(({ id, ...product }, index) => {
          if (snapshots[index].exists()) return;
          tx.set(refs[index], { ...product, createdAt: serverTimestamp() });
          count++;
        });
        return count;
      });
      notify(`${created} supplied jerseys published at ₹249 each.`);
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
        {remaining} jerseys · ₹249 each · M, L, XL, XXL. Uses the supplied
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
        {busy ? "Publishing jerseys…" : `Publish ${remaining} supplied jerseys`}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
