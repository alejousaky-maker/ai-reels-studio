import React, { useState } from "react";
import { api } from "../api";
import { useData } from "../hooks";
import { go } from "../main";

const TYPES = [["story", "Historia / curiosidad"], ["explainer", "Explicador"], ["ad", "Anuncio de negocio"]];
const STYLES = [["storybook", "Storybook 2.5D"], ["cinematic_explainer", "Cinematic Explainer"], ["minimal_stickman", "Minimal Stickman"], ["product_ad", "Product Ad"], ["custom_brand", "Custom Brand"]];

export const Create: React.FC = () => {
  const [opts] = useData<any>("/api/options");
  const [clients] = useData<any[]>("/api/clients");
  const [f, setF] = useState<any>({ title: "", idea: "", script: "", kind: "story", lang: "en", seconds: 60, quality: "standard", style: "storybook",
    environment: "village_square", voice: "", speed: 1.0, clientId: "", cta: "", captions: false, music: true, variants: 1, provider: "auto", review: "auto_qa" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));
  const voices: [string, string][] = opts?.voices?.[f.lang] ?? [];
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const body = { ...f, title: f.title || (f.idea || f.script).split(/[.!?\n]/)[0].slice(0, 80) || "Nuevo vídeo", voice: f.voice || null, clientId: f.clientId || null, cta: f.cta || null };
      const r = await api.post("/api/projects", body);
      go(`project/${r.id}`);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  const canGo = (f.idea.trim().length > 5 || f.script.trim().length > 20) && !busy;
  const noAI = opts && !opts.ollamaModels?.length;
  return (
    <>
      <h1>Crear vídeo</h1>
      <p className="sub">Idea → estilo → idioma → Crear. El resto tiene valores por defecto; los controles avanzados están plegados.</p>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}>
        <div className="card grid">
          <label className="f">Idea del vídeo (una frase basta)
            <textarea value={f.idea} onChange={(e) => set("idea", e.target.value)} placeholder="p. ej. Por qué en 1518 una ciudad entera no podía dejar de bailar" />
          </label>
          <div>
            <h3>Tipo</h3>
            <div className="chips">{TYPES.map(([k, l]) => <button key={k} className={`chip ${f.kind === k ? "on" : ""}`} onClick={() => { set("kind", k); if (k === "ad") { set("style", "product_ad"); set("seconds", 30); set("environment", "street"); } }}>{l}</button>)}</div>
          </div>
          <div>
            <h3>Estilo visual</h3>
            <div className="chips">{STYLES.map(([k, l]) => <button key={k} className={`chip ${f.style === k ? "on" : ""}`} onClick={() => set("style", k)}>{l}</button>)}</div>
          </div>
          <div className="grid g3">
            <label className="f">Idioma
              <select value={f.lang} onChange={(e) => { set("lang", e.target.value); set("voice", ""); }}><option value="en">English</option><option value="es">Español</option></select></label>
            <label className="f">Duración
              <select value={f.seconds} onChange={(e) => set("seconds", Number(e.target.value))}>{[15, 30, 45, 60, 90].map((s) => <option key={s} value={s}>{s} s</option>)}</select></label>
            <label className="f">Calidad
              <select value={f.quality} onChange={(e) => set("quality", e.target.value)}><option value="draft">Draft 540×960 (rápido)</option><option value="standard">Standard 1080×1920</option><option value="master">Master 2K 1440×2560</option></select></label>
          </div>
          {f.kind === "ad" && (
            <div className="grid g2">
              <label className="f">Marca / cliente
                <select value={f.clientId} onChange={(e) => set("clientId", e.target.value)}><option value="">Proyecto sin cliente</option>{(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className="f">CTA (opcional)<input type="text" value={f.cta} onChange={(e) => set("cta", e.target.value)} placeholder="Visítanos hoy" /></label>
            </div>
          )}
          <details className="adv">
            <summary>Opciones avanzadas</summary>
            <div className="grid" style={{ marginTop: 12 }}>
              <label className="f">Título<input type="text" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="(se toma de la idea)" /></label>
              <label className="f">Guion propio (opcional: si lo escribes, no se usa IA; una o dos frases por escena)
                <textarea value={f.script} onChange={(e) => set("script", e.target.value)} style={{ minHeight: 140 }} /></label>
              <div className="grid g3">
                <label className="f">Escenario<select value={f.environment} onChange={(e) => set("environment", e.target.value)}>{["village_square", "market", "street", "park"].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label className="f">Voz<select value={f.voice} onChange={(e) => set("voice", e.target.value)}><option value="">Por defecto</option>{voices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                <label className="f">Velocidad de voz<input type="number" step="0.05" min="0.8" max="1.3" value={f.speed} onChange={(e) => set("speed", Number(e.target.value))} /></label>
                <label className="f">Guionista<select value={f.provider} onChange={(e) => set("provider", e.target.value)}>
                  <option value="auto">Automático (IA local si existe)</option><option value="ollama">Ollama local</option><option value="template">Sin IA (reglas)</option><option value="claude">Claude asistido (copiar/pegar)</option></select></label>
                <label className="f">Revisión humana<select value={f.review} onChange={(e) => set("review", e.target.value)}>
                  <option value="auto_qa">Autónomo con QA</option><option value="approve_script">Aprobar guion antes de producir</option></select></label>
                <label className="f">Variantes<select value={f.variants} onChange={(e) => set("variants", Number(e.target.value))}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
              </div>
              <div className="row">
                <label className="row small"><input type="checkbox" checked={f.music} onChange={(e) => set("music", e.target.checked)} /> Música original</label>
                <label className="row small"><input type="checkbox" checked={f.captions} onChange={(e) => set("captions", e.target.checked)} /> Subtítulos palabra a palabra</label>
              </div>
            </div>
          </details>
          {err && <div className="err">{err}</div>}
          <div className="row"><button className="btn primary big" disabled={!canGo} onClick={submit}>{busy ? "Creando…" : "Crear vídeo"}</button>
            <span className="small muted">Se añade a la cola. Puedes seguir usando la app.</span></div>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          <div className="card">
            <h3>Qué va a pasar</h3>
            <ol className="small muted" style={{ lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
              <li>Idea y guion (IA local, reglas o tu texto)</li><li>Hechos marcados en FACTS.md (verificado / incierto / ficción)</li><li>Storyboard tipado y validado</li>
              <li>Voz local Kokoro + tiempos por palabra</li><li>Escenas 2.5D: personajes, cámara, luz, tinta, DOF</li><li>Música original, efectos y mezcla a −14 LUFS</li>
              <li>Fotogramas de control</li><li>QA técnico medido</li><li>Render final MP4 H.264 + AAC</li>
            </ol>
          </div>
          <div className="card small">
            <h3>Coste</h3>
            <p className="muted" style={{ margin: 0 }}>0 € en servicios: todo corre en este PC (electricidad aparte). Ningún servicio de pago se usa sin que lo actives tú.</p>
          </div>
          {noAI && <div className="card small" style={{ borderColor: "#6a5527" }}><b>Sin IA local detectada.</b> <span className="muted">Escribe tu guion en «Opciones avanzadas», usa «Claude asistido», o instala Ollama.</span></div>}
          {opts?.ollamaModels?.length > 0 && <div className="card small muted">IA local disponible: {opts.ollamaModels.join(", ")}. Un modelo pequeño escribe borradores útiles, no iguala a un guionista experto: revisa el guion.</div>}
        </div>
      </div>
    </>
  );
};
