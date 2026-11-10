import React, { useState } from "react";
import { api } from "../api";
import { useData } from "../hooks";
import { JobRow } from "./common";

const ENVS: [string, string][] = [["village_square", "Plaza del pueblo"], ["market", "Mercado"], ["street", "Calle"], ["park", "Parque"], ["interior", "Interior / local"], ["harbour", "Puerto con faro"]];
const LIGHTS: [string, string][] = [["day", "Día"], ["golden", "Atardecer"], ["night", "Noche"]];
const ASPECTS: [string, string][] = [["9:16", "9:16 vertical"], ["1:1", "1:1 cuadrada"], ["4:5", "4:5 feed"], ["16:9", "16:9 horizontal"]];

export const Images: React.FC = () => {
  const [opts] = useData<any>("/api/options");
  const [gallery, , reloadG] = useData<any[]>("/api/images", 4000);
  const [jobs, , reloadJ] = useData<any[]>("/api/jobs?limit=20", 1500);
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [variants, setVariants] = useState(2);
  const [spec, setSpec] = useState<any>(null);
  const [err, setErr] = useState("");
  const live = (jobs ?? []).filter((j) => j.kind === "image" && (j.status === "running" || j.status === "queued" || j.status === "failed")).slice(0, 3);
  const read = () => api.post("/api/images/preview-spec", { prompt, aspect, variants }).then(setSpec).catch((e) => setErr(e.message));
  const go = (useSpec: boolean) => {
    setErr("");
    api.post("/api/images", { prompt, aspect, variants, spec: useSpec ? spec : null }).then(() => { reloadJ(); }).catch((e) => setErr(e.message));
  };
  const setC = (i: number, k: string, v: any) => { const cs = [...spec.characters]; cs[i] = { ...cs[i], [k]: v || null }; setSpec({ ...spec, characters: cs }); };
  return (
    <>
      <h1>Imágenes desde un prompt</h1>
      <p className="sub">Escribe lo que quieres ver (en español o inglés). Se renderiza con el mismo motor y estilo que los vídeos: escenarios 3D pintados, personajes 2D, luz y tinta. Todo local.</p>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)" }}>
        <div className="card grid">
          <label className="f">Prompt
            <textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setSpec(null); }} placeholder="p. ej. Una niña sorprendida con un café en el puerto al atardecer" /></label>
          <div className="chips">{ASPECTS.map(([k, l]) => <button key={k} className={`chip ${aspect === k ? "on" : ""}`} onClick={() => setAspect(k)}>{l}</button>)}</div>
          <div className="row">
            <label className="f" style={{ flexDirection: "row", alignItems: "center" }}>Variantes
              <select value={variants} onChange={(e) => setVariants(Number(e.target.value))} style={{ width: 80 }}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
            <span className="sp" />
            <button className="btn" disabled={prompt.trim().length < 3} onClick={read}>Ver cómo lo entiende</button>
            <button className="btn primary" disabled={prompt.trim().length < 3} onClick={() => go(!!spec)}>Generar imagen</button>
          </div>
          {err && <div className="err">{err}</div>}
          {spec && (
            <div className="grid" style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <h3 style={{ margin: 0 }}>Escena (editable antes de generar)</h3>
              <div className="grid g3">
                <label className="f">Lugar<select value={spec.environment} onChange={(e) => setSpec({ ...spec, environment: e.target.value })}>{ENVS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label className="f">Luz<select value={spec.light} onChange={(e) => setSpec({ ...spec, light: e.target.value })}>{LIGHTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label className="f">Plano<select value={spec.shot} onChange={(e) => setSpec({ ...spec, shot: e.target.value })}>{(opts?.shots ?? []).map((x: string) => <option key={x}>{x}</option>)}</select></label>
              </div>
              {spec.characters.map((c: any, i: number) => (
                <div key={i} className="row">
                  <select value={c.role} onChange={(e) => setC(i, "role", e.target.value)} style={{ maxWidth: 150 }}>{(opts?.roles ?? []).map((x: string) => <option key={x}>{x}</option>)}</select>
                  <select value={c.action} onChange={(e) => setC(i, "action", e.target.value)} style={{ maxWidth: 110 }}>{(opts?.actions ?? []).map((x: string) => <option key={x}>{x}</option>)}</select>
                  <select value={c.expr} onChange={(e) => setC(i, "expr", e.target.value)} style={{ maxWidth: 130 }}>{(opts?.expressions ?? []).map((x: string) => <option key={x}>{x}</option>)}</select>
                  <select value={c.holding ?? ""} onChange={(e) => setC(i, "holding", e.target.value)} style={{ maxWidth: 130 }}><option value="">(sin objeto)</option>{(opts?.products ?? []).map((x: string) => <option key={x}>{x}</option>)}</select>
                  <button className="btn sm danger" onClick={() => setSpec({ ...spec, characters: spec.characters.filter((_: any, k: number) => k !== i) })}>✕</button>
                </div>))}
              <div className="row">
                <button className="btn sm" disabled={spec.characters.length >= 6} onClick={() => setSpec({ ...spec, characters: [...spec.characters, { role: "villager_man", action: "stand", expr: "smile", holding: null }] })}>+ Personaje</button>
                <label className="f" style={{ flexDirection: "row", alignItems: "center" }}>Gente de fondo<input type="number" min={0} max={8} value={spec.extras} onChange={(e) => setSpec({ ...spec, extras: Number(e.target.value) })} style={{ width: 70 }} /></label>
                <label className="f" style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>Texto<input type="text" value={spec.text ?? ""} onChange={(e) => setSpec({ ...spec, text: e.target.value || null })} /></label>
              </div>
            </div>
          )}
          <p className="small dim">Con IA local (Ollama) el prompt se interpreta mejor; sin ella se usa un lector de palabras clave. «Ver cómo lo entiende» muestra la lectura por palabras clave para que la ajustes.</p>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          {live.map((j) => <JobRow key={j.id} j={j} onChange={reloadJ} />)}
          {!live.length && <div className="card muted small">Sin imágenes en proceso. Cada variante tarda unos segundos en tu GPU.</div>}
        </div>
      </div>
      <h2 style={{ marginTop: 22 }}>Galería</h2>
      <div className="grid g4">
        {(gallery ?? []).flatMap((g) => g.files.map((f: string) => (
          <div key={g.id + f} className="card" style={{ padding: 10 }}>
            <a href={`/api/images/${g.id}/${f}`} target="_blank" rel="noreferrer"><img src={`/api/images/${g.id}/${f}`} alt={g.prompt} style={{ width: "100%", borderRadius: 8, background: "#0e0c12" }} /></a>
            <div className="small" style={{ marginTop: 6 }}>{g.prompt}</div>
            <div className="row small dim" style={{ marginTop: 4 }}><span>{g.aspect} · {g.size?.join("×")} · {g.provider}</span><span className="sp" />
              <a className="btn sm" href={`/api/images/${g.id}/${f}`} download={`${g.id}_${f}`}>Descargar</a>
              <button className="btn sm" onClick={() => { setPrompt(g.prompt); setAspect(g.aspect); setSpec(g.spec); window.scrollTo(0, 0); }}>Editar</button></div>
          </div>)))}
        {gallery && !gallery.length && <div className="card muted">Aún no hay imágenes.</div>}
      </div>
      <span style={{ display: "none" }}>{String(reloadG)}</span>
    </>
  );
};
