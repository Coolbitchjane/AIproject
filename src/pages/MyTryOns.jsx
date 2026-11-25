import { useEffect, useState } from "react";
import { api } from "../api";

export default function MyTryOns() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/tryons")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.status === 401 ? "Please log in to see your try-ons." : e.message))
      .finally(() => setLoading(false));
  }, []);

  async function toggleLike(t) {
    try {
      await api(`/tryons/${t.id}`, { method: "PATCH", body: { liked: !t.liked } });
      setItems((list) => list.map((x) => (x.id === t.id ? { ...x, liked: !t.liked } : x)));
    } catch (e) { setError(e.message); }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!items.length) return <p>You haven't tried anything on yet.</p>;

  return (
    <ul>
      {items.map((t) => (
        <li key={t.id}>
          <strong>{t.garment_name}</strong> · size {t.size_tried} · fits: {t.fit_result}
          <button onClick={() => toggleLike(t)}>{t.liked ? "♥ Liked" : "♡ Like"}</button>
        </li>
      ))}
    </ul>
  );
}
