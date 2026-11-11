import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useData } from "../hooks";

type Model = { id: string; name: string; categories: string[]; dims_m: number[]; thumb?: string; downloaded?: boolean; source?: string; polycount?: number };
type Pick = { id: string; role: "surface" | "active"; mass: number; friction: number; restitution: number; height: number };

/** 3D Asset Library: Poly Haven models (CC0) + physics clips (Blender rigid bodies) */
export const Assets3D: React.FC = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [res, setRes] = useState<Model[]>([]);
  const [cats] = useData<{ name: string; count: number }[]>("/api/assets3d/categories");
  const [mine, , reloadMine] = useData<any[]>("/api/assets3d/downloaded");
  const [presets] = useData<{ name: string; help: string }[]>("/api/assets3d/presets");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [picks, setPicks] = useState<Pick[]>([]);
  const [preset, setPreset] = useState("FALL_AND_BOUNCE");
  const [gravity, setGravity] = useState(9.81);
  const [ret, setRet] = useState(true);
  const [text, setText] = useState("");
  const [job, setJob] = useState<any>(null);

  const search = async () => { try { const r = await api.get(`/api/assets3d/search?q=${encodeURIComponent(q)}${cat ? `&category=${encodeURIComponent(cat)}` : ""}`); setRes(r.results); } catch (e: any) { setNote("Error: " + e.message); } };
  const importRef = async (ref: string) => {
    setNote(`Descargando ${ref}…`);
    try { const r = await api.post("/api/assets3d/import", { ref }); setNote(`Importado: ${r.name} (${r.dims_m.join(" × ")} m, ${r.format} ${r.res})`); reloadMine(); search(); } catch (e: any) { setNote("Error: " + e.message); }
  };
  const add = (id: string) => setPicks((p) => [...p, { id, role: p.length === 0 ? "surface" : "active", mass: 1, friction: 0.5, restitution: 0.4, height: p.length === 0 ? 0 : 1.6 }]);
  const spec = () => {
    const surf = picks.find((p) => p.role === "surface");
    const top = surf ? 0.8 : 0;
    const objects = picks.map((p, i) => ({
      id: `${p.id}_${i}`, asset: p.id, body: p.role === "surface" ? "passive" : "active", shape: p.role === "surface" ? "MESH" : "CONVEX_HULL",
      position: p.role === "surface" ? [0, 0, 0] : [0.15 * (i - 1), 0, top + p.height], mass: p.mass, friction: p.friction, restitution: p.restitution,
    }));
    const movers = objects.filter((o) => o.body === "active").map((o) => o.id);
    const events: any[] = [];
    if (movers[0] && preset !== "FALL_AND_BOUNCE") events.push(preset === "EXPLOSION_IMPULSE" ? { preset, objects: movers, params: { center: [0, 0, top] } }
      : preset === "SLOW_MOTION_IMPACT" ? { preset, params: { time_scale: 0.4 } } : { preset: "IMPULSE", object: movers[0], params: { release: 20, velocity: [0.6, 0, -0.3] } });
    if (ret && movers[0]) events.push({ preset: "RETURN_TO_ORIGIN", object: movers[0], params: { at: 220, frames: 55 } });
    return { format: "vertical", fps: 30, seconds: 10, hdri: "studio_small_09", gravity, objects, events, camera: { follow: movers.length ? movers : objects.map((o) => o.id) } };
  };
  const render = async (quality: string, useText = false) => {
    try { setJob(await api.post("/api/assets3d/physics", useText ? { text, quality } : { spec: spec(), quality })); } catch (e: any) { setNote("Error: " + e.message); }
  };
  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) return;
    const t = setInterval(async () => setJob(await api.get(`/api/jobs/${job.id}`)), 3000);
    return () => clearInterval(t);
  }, [job]);
  const result = job?.result ? (typeof job.result === "string" ? JSON.parse(job.result) : job.result) : null;

  return (
    <>
      <h1>3D Asset Library</h1>
      <p className="sub">Modelos 3D reales de <b>Poly Haven</b> (CC0, crédito en cada vídeo) y clips con física de cuerpos rígidos (Blender). Se descargan solo los que eliges y se reutilizan en todos los vídeos.</p>
      <div className="card grid" style={{ marginBottom: 16 }}>
        <div className="grid g3">
          <label className="f">Buscar<input type="text" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="chair, crate, ball, lamp…" /></label>
          <label className="f">Categoría<select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas</option>{(cats ?? []).map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}</select></label>
          <label className="f">Importar por enlace<input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://polyhaven.com/a/…" /></label>
        </div>
        <div><button className="btn" onClick={search}>Buscar</button> <button className="btn" disabled={!link.trim()} onClick={() => importRef(link)}>Importar enlace</button></div>
        {note && <div className={note.startsWith("Error") ? "err" : "okbox"}>{note}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
          {res.map((m) => (
            <div key={m.id} className="card" style={{ padding: 8 }}>
              {m.thumb && <img src={m.thumb} alt={m.name} style={{ width: "100%", borderRadius: 6 }} loading="lazy" />}
              <div className="small"><b>{m.name}</b><br />{m.dims_m?.join(" × ")} m · <span className="muted">Poly Haven</span></div>
              {m.downloaded ? <button className="btn" onClick={() => add(m.id)}>Añadir a escena</button> : <button className="btn" onClick={() => importRef(m.id)}>Descargar</button>}
            </div>))}
        </div>
      </div>
      <div className="grid g2">
        <div className="card grid">
          <h3>Escena con física</h3>
          {picks.length === 0 && <div className="muted small">Añade modelos descargados: el primero hace de superficie (mesa, suelo), los demás se mueven.</div>}
          {picks.map((p, i) => (
            <div key={i} className="grid g3 small">
              <span><b>{p.id}</b> <select value={p.role} onChange={(e) => setPicks(picks.map((x, k) => k === i ? { ...x, role: e.target.value as any } : x))}><option value="surface">superficie</option><option value="active">dinámico</option></select></span>
              <label>masa {p.mass} kg<input type="range" min={0.1} max={20} step={0.1} value={p.mass} onChange={(e) => setPicks(picks.map((x, k) => k === i ? { ...x, mass: +e.target.value } : x))} /></label>
              <label>rebote {p.restitution}<input type="range" min={0} max={0.95} step={0.05} value={p.restitution} onChange={(e) => setPicks(picks.map((x, k) => k === i ? { ...x, restitution: +e.target.value } : x))} /></label>
              <label>fricción {p.friction}<input type="range" min={0} max={1.2} step={0.05} value={p.friction} onChange={(e) => setPicks(picks.map((x, k) => k === i ? { ...x, friction: +e.target.value } : x))} /></label>
              <label>altura {p.height} m<input type="range" min={0} max={4} step={0.1} value={p.height} onChange={(e) => setPicks(picks.map((x, k) => k === i ? { ...x, height: +e.target.value } : x))} /></label>
              <button className="btn" onClick={() => setPicks(picks.filter((_, k) => k !== i))}>Quitar</button>
            </div>))}
          <label className="f">Preset<select value={preset} onChange={(e) => setPreset(e.target.value)}>{(presets ?? []).map((p) => <option key={p.name} value={p.name}>{p.name} — {p.help}</option>)}</select></label>
          <label className="f">Gravedad {gravity} m/s²<input type="range" min={1} max={20} step={0.1} value={gravity} onChange={(e) => setGravity(+e.target.value)} /></label>
          <label className="small"><input type="checkbox" checked={ret} onChange={(e) => setRet(e.target.checked)} /> Volver al origen al final (animado)</label>
          <div><button className="btn" disabled={!picks.length} onClick={() => render("draft")}>Previsualizar (rápido)</button> <button className="btn" disabled={!picks.length} onClick={() => render("high")}>Generar vídeo</button></div>
          <label className="f">…o descríbela<textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="A ball falls from a table, hits some boxes and returns to where it started" /></label>
          <div><button className="btn" disabled={!text.trim()} onClick={() => render("standard", true)}>Generar desde texto</button></div>
          {job && <div className="small">Trabajo {job.id}: {job.status} {job.message}</div>}
          {result?.video && <video src={result.video} controls style={{ maxWidth: 270 }} />}
          {result?.verify && <pre className="small">{JSON.stringify(result.verify, null, 1)}</pre>}
        </div>
        <div className="card" style={{ padding: 0 }}>
          <h3 style={{ padding: "14px 14px 0" }}>Modelos descargados ({(mine ?? []).length})</h3>
          <table><thead><tr><th>Modelo</th><th>Medidas (m)</th><th>Fuente</th><th></th></tr></thead>
            <tbody>{(mine ?? []).map((m) => <tr key={m.id}><td className="small">{m.name}</td><td className="small">{m.dims_m?.join(" × ")}</td><td className="small">Poly Haven · CC0</td><td><button className="btn" onClick={() => add(m.id)}>Usar</button></td></tr>)}</tbody></table>
        </div>
      </div>
    </>
  );
};
