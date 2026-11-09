import React, { useState } from "react";
import { api } from "../api";
import { useData } from "../hooks";

export const Settings: React.FC = () => {
  const [diag, , rediag] = useData<any>("/api/diagnostics");
  const [opts] = useData<any>("/api/options");
  const [st, , restorage] = useData<any>("/api/storage");
  const [logs, , relog] = useData<any>("/api/logs?lines=300");
  const [note, setNote] = useState("");
  const s = opts?.settings;
  const save = (k: string, v: any) => api.put("/api/settings", { [k]: v }).then(() => setNote("Ajuste guardado.")).catch((e) => setNote("Error: " + e.message));
  return (
    <>
      <h1>Ajustes y diagnóstico</h1>
      <p className="sub">Comprueba tu PC, elige valores por defecto y libera espacio de forma segura.</p>
      {note && <div className="okbox" style={{ marginBottom: 12 }}>{note}</div>}
      <div className="grid g2">
        <div className="card">
          <div className="row"><h3 style={{ margin: 0 }}>Diagnóstico</h3><span className="sp" /><button className="btn sm" onClick={rediag}>Volver a comprobar</button></div>
          {diag ? <table><tbody>
            <tr><td>GPU</td><td>{diag.gpu ? `${diag.gpu.name} · ${diag.gpu.vramMB} MB VRAM · driver ${diag.gpu.driver} · uso ${diag.gpu.util}%` : "No detectada (render por software, más lento)"}</td></tr>
            <tr><td>RAM</td><td>{diag.ramGB} GB ({diag.ramFreeGB} GB libres)</td></tr><tr><td>CPU</td><td>{diag.cpu?.threads} hilos</td></tr>
            <tr><td>Disco</td><td>{diag.disk.projectDrive} {diag.disk.freeGB} GB libres de {diag.disk.totalGB}</td></tr>
            {Object.entries(diag.tools).map(([k, v]) => <tr key={k}><td>{k}</td><td className="small">{v === true ? "✅" : v ? String(v) : "❌ falta"}</td></tr>)}
            {Object.entries(diag.models).map(([k, v]) => <tr key={k}><td>modelo {k}</td><td>{v === true ? "✅" : v ? String(v) : "❌ falta"}</td></tr>)}
            <tr><td>IA local</td><td>{diag.ollamaModels?.length ? diag.ollamaModels.join(", ") : "ninguna (opcional)"}</td></tr>
          </tbody></table> : <div className="muted">Comprobando…</div>}
          {diag?.problems?.map((p: any, i: number) => <div key={i} className="small" style={{ marginTop: 8 }}><b>{p.what}</b> — <span className="muted">{p.fix}</span></div>)}
          <p className="small dim">¿Se usa la RTX? Durante un render, el uso de GPU de esta tabla sube (o mira el Administrador de tareas → Rendimiento → GPU → «3D»). Chrome renderiza con ANGLE (Direct3D).</p>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          <div className="card grid">
            <h3>Valores por defecto</h3>
            {s && <>
              <label className="f">Calidad<select defaultValue={s.quality} onChange={(e) => save("quality", e.target.value)}><option value="draft">Draft</option><option value="standard">Standard</option><option value="master">Master 2K</option></select></label>
              <label className="f">Voz EN<select defaultValue={s.voiceEn} onChange={(e) => save("voiceEn", e.target.value)}>{opts.voices.en.map(([v, l]: string[]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label className="f">Voz ES<select defaultValue={s.voiceEs} onChange={(e) => save("voiceEs", e.target.value)}>{opts.voices.es.map(([v, l]: string[]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label className="f">Modelo Ollama<select defaultValue={s.ollamaModel ?? ""} onChange={(e) => save("ollamaModel", e.target.value || null)}><option value="">Automático</option>{(opts.ollamaModels ?? []).map((m: string) => <option key={m}>{m}</option>)}</select></label>
              <label className="f">Umbral de aprobación QA (0–10)<input type="number" min={0} max={10} defaultValue={s.qaThreshold} onBlur={(e) => save("qaThreshold", Number(e.target.value))} /></label>
            </>}
            <p className="small dim">ElevenLabs u otros servicios de pago: desactivados. No hay ninguna clave configurada.</p>
          </div>
          <div className="card grid">
            <h3>Almacenamiento</h3>
            {st && <table><tbody>{Object.entries(st.partsMB).map(([k, v]) => <tr key={k}><td>{k}</td><td>{String(v)} MB</td></tr>)}<tr><td>Libre</td><td>{st.freeGB} GB</td></tr></tbody></table>}
            <button className="btn" onClick={() => api.post("/api/cache/clean").then((r) => { setNote(`Liberados ${r.freedMB} MB (solo carpetas temporales de AI Reels Studio).`); restorage(); }).catch((e) => setNote("Error: " + e.message))}>Limpiar caché segura</button>
            <p className="small dim">Solo borra work/remotion-tmp y bundles antiguos de esta app. Nunca toca TEMP del sistema, proyectos ni otras aplicaciones.</p>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}><div className="row"><h3 style={{ margin: 0 }}>Registros</h3><span className="sp" /><button className="btn sm" onClick={relog}>Actualizar</button></div>
        <pre className="log">{(logs?.lines ?? []).join("") || "Sin registros todavía."}</pre></div>
    </>
  );
};
