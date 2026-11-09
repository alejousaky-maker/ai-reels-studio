export type Job = { id: string; project_id: string; kind: string; status: string; progress: number; step: string; message: string; error?: string; log?: string; created?: string; started?: string; finished?: string; result?: any };
export type Project = any;

async function req<T>(method: string, url: string, body?: any): Promise<T> {
  const init: RequestInit = { method, headers: {} };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) { init.body = JSON.stringify(body); (init.headers as any)["Content-Type"] = "application/json"; }
  const r = await fetch(url, init);
  if (!r.ok) {
    let msg = `${r.status} ${r.statusText}`;
    try { const j = await r.json(); msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail ?? j); } catch { /* not json */ }
    throw new Error(msg);
  }
  return r.json();
}
export const api = {
  get: <T = any>(u: string) => req<T>("GET", u),
  post: <T = any>(u: string, b?: any) => req<T>("POST", u, b ?? {}),
  put: <T = any>(u: string, b?: any) => req<T>("PUT", u, b),
  patch: <T = any>(u: string, b?: any) => req<T>("PATCH", u, b),
  upload: <T = any>(u: string, f: FormData) => req<T>("POST", u, f),
};
export const fileUrl = (pid: string, rel: string, bust = "") => `/api/projects/${pid}/files/${rel}${bust ? `?v=${bust}` : ""}`;
export const fmtTime = (s?: number | null) => (s == null ? "—" : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`);
export const STATUS_LABEL: Record<string, string> = {
  queued: "En cola", running: "Procesando", awaiting_review: "Esperando revisión", done: "Terminado", failed: "Error", canceled: "Cancelado",
  draft: "Borrador", qa_failed: "QA con fallos", approved: "Aprobado", changes_requested: "Cambios pedidos", edited: "Editado", plan_edited: "Guion editado",
};
export const STEPS = [["script", "Idea y guion"], ["voice", "Voz"], ["align", "Tiempos de palabras"], ["storyboard", "Storyboard"], ["stills", "Fotogramas de control"],
  ["render", "Render"], ["mix", "Audio y mezcla"], ["qa", "QA técnico"]] as const;
