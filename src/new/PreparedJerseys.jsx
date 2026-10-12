import { useRef, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "./core.jsx";
import jerseys from "./preparedJerseys.json";

export default function PreparedJerseys() {
  const { isAdmin } = useAuth();
  const { liveProducts, notify } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const existing = new Set(liveProducts.map((p) => p.id));
  const remaining = jerseys.filter((p) => !existing.has(p.id)).length;

  async function publish() {
    if (!isAdmin || running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      const created = await runTransaction(db, async (tx) => {
        const refs = jerseys.map((p) => doc(db, "products", p.id));
        const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
        let count = 0;
        jerseys.forEach(({ id, ...product }, i) => {
          if (snapshots[i].exists()) return;
          tx.set(refs[i], { ...product, createdAt: serverTimestamp() });
          count++;
        });
        return count;
      });
      notify(`${created} new jerseys published.`);
    } catch (e) {
      setError(e.code === "permission-denied"
        ? "Your account cannot publish this collection. Check staff access and database rules."
        : "The collection could not be published. Please retry.");
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  if (!isAdmin || remaining === 0) return null;
  return (
    <div className="notice" style={{ marginBottom: 24 }}>
      <b>Prepared jersey collection</b>
      <p>{remaining} new jerseys · ₹349 each · M, L, XL, XXL. Stock is confirmed on WhatsApp. The collection includes 97 studio images; five jerseys have front and model views only.</p>
      <button className="btn btn-red" disabled={busy} onClick={publish}>
        {busy ? "Publishing collection…" : `Publish ${remaining} jerseys`}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
