import React from "react";
import { Job, STATUS_LABEL, api } from "../api";

export const StatusPill: React.FC<{ s?: string }> = ({ s }) => {
  const cls = s === "done" || s === "approved" ? "ok" : s === "failed" || s === "qa_failed" ? "bad" : s === "running" || s === "queued" ? "run" : s === "awaiting_review" || s === "changes_requested" ? "warn" : "";
  return <span className={`pill ${cls}`}>{STATUS_LABEL[s ?? ""] ?? s ?? "—"}</span>;
};

export const JobRow: React.FC<{ j: Job; onChange?: () => void; showProject?: boolean }> = ({ j, onChange, showProject }) => {
  const live = j.status === "running" || j.status === "queued";
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row">
        <StatusPill s={j.status} />
        <b style={{ fontSize: 14 }}>{KIND[j.kind] ?? j.kind}</b>
        {showProject && (j.project_id ? <a className="small" href={`#project/${j.project_id}`}>{j.project_id}</a> : <a className="small" href="#images">imagen</a>)}
        <span className="sp" />
        {live && <button className="btn sm danger" onClick={() => api.post(`/api/jobs/${j.id}/cancel`).then(onChange)}>Cancelar</button>}
        {(j.status === "failed" || j.status === "canceled") && <button className="btn sm" onClick={() => api.post(`/api/jobs/${j.id}/retry`).then(onChange)}>Reintentar</button>}
      </div>
      {live && <div style={{ marginTop: 10 }}><div className="bar"><i style={{ width: `${Math.round((j.progress || 0) * 100)}%` }} /></div></div>}
      <div className="small muted" style={{ marginTop: 8 }}>{j.step ? `${STEP[j.step] ?? j.step} · ` : ""}{j.message}</div>
      {j.status === "failed" && <div className="err" style={{ marginTop: 8 }}>{explain(j)}</div>}
    </div>
  );
};

const KIND: Record<string, string> = { create: "Crear vídeo completo", produce: "Producir vídeo", plan: "Escribir guion (para aprobar)", voice: "Voz + tiempos + storyboard",
  storyboard: "Storyboard", stills: "Fotogramas de control", render: "Render + mezcla + QA", regen_scene: "Regenerar escenas cambiadas", mix: "Remezclar audio", qa: "QA técnico", image: "Imagen desde prompt", script: "Guion desde prompt", redirect: "Re-dirigir escenas desde la narración" };
const STEP: Record<string, string> = { script: "Guion", voice: "Voz", align: "Tiempos", storyboard: "Storyboard", stills: "Fotogramas", render: "Render", mix: "Mezcla" };

/** turn a failure into: what happened + how to fix it */
export function explain(j: Job): string {
  const m = (j.message || "") + " " + (j.error || "");
  if (/interrupted/.test(m)) return "El trabajo se interrumpió porque la app se cerró. Pulsa Reintentar: los pasos ya hechos (voz, escenas renderizadas) se reutilizan.";
  if (/Kokoro|kokoro/.test(m)) return "Falta el modelo de voz Kokoro. Ejecuta install.ps1 o sube tu propia voz (WAV/MP3) en el proyecto → Voz.";
  if (/Ollama|No local AI/.test(m)) return "No hay IA local disponible. Escribe el guion en el formulario, usa el modo «Claude asistido», o instala Ollama (ajustes → diagnóstico).";
  if (/ENOSPC|No space/.test(m)) return "Disco lleno. Libera espacio o limpia la caché en Ajustes → Almacenamiento y reintenta.";
  if (/render engine failed/.test(m)) return "Falló el motor de render (Chrome/WebGL). Reintenta; si se repite, mira Ajustes → Registros. Los segmentos ya renderizados se conservan.\n\n" + (j.message || "");
  return (j.message || "Error desconocido") + "\n\nPulsa Reintentar. Si se repite, copia el registro de Ajustes → Registros.";
}
