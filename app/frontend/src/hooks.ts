import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

/** fetch + optional polling; returns [data, error, reload] */
export function useData<T = any>(url: string | null, pollMs = 0): [T | null, string, () => void] {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState("");
  const alive = useRef(true);
  const load = useCallback(() => {
    if (!url) return;
    api.get<T>(url).then((d) => { if (alive.current) { setData(d); setErr(""); } }).catch((e) => alive.current && setErr(String(e.message || e)));
  }, [url]);
  useEffect(() => {
    alive.current = true; load();
    const t = pollMs ? setInterval(load, pollMs) : undefined;
    return () => { alive.current = false; if (t) clearInterval(t); };
  }, [load, pollMs]);
  return [data, err, load];
}
