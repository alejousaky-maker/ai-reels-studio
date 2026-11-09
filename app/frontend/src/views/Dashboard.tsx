import React from "react";
import { useData } from "../hooks";
import { fileUrl, fmtTime } from "../api";
import { JobRow, StatusPill } from "./common";

export const Dashboard: React.FC = () => {
  const [projects] = useData<any[]>("/api/projects", 5000);
  const [jobs, , reload] = useData<any[]>("/api/jobs?limit=30", 2000);
  const [storage] = useData<any>("/api/storage", 30000);
  const [diag] = useData<any>("/api/diagnostics");
  const live = (jobs ?? []).filter((j) => j.status === "running" || j.status === "queued");
  const done = (projects ?? []).filter((p) => p.videos?.length);
  const totalSec = done.reduce((a, p) => a + (p.duration || 0), 0);
  return (
    <>
      <div className="row"><div><h1>Panel</h1><p className="sub">Tu fábrica local de Reels/Shorts. Todo se procesa en este PC.</p></div><span className="sp" />
        <a className="btn primary big" href="#create">✚ Crear vídeo</a></div>
      {diag && diag.problems?.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "#6a5527" }}>
          <h3>Avisos del sistema</h3>
          {diag.problems.map((p: any, i: number) => <div key={i} className="small" style={{ marginBottom: 6 }}><b>{p.what}.</b> <span className="muted">{p.fix}</span></div>)}
        </div>
      )}
      <div className="grid g4" style={{ marginBottom: 18 }}>
        <div className="card stat"><div className="n">{projects?.length ?? "…"}</div><div className="l">Proyectos</div></div>
        <div className="card stat"><div className="n">{live.length}</div><div className="l">Trabajos en curso / en cola</div></div>
        <div className="card stat"><div className="n">{done.length}</div><div className="l">Vídeos terminados · {fmtTime(totalSec)} en total</div></div>
        <div className="card stat"><div className="n">{storage ? `${storage.freeGB} GB` : "…"}</div><div className="l">Libres · proyectos {storage ? Math.round(storage.partsMB.projects) : "…"} MB</div></div>
      </div>
      <div className="grid g2">
        <div>
          <h2>En curso</h2>
          <div className="grid">{live.length ? live.map((j) => <JobRow key={j.id} j={j} onChange={reload} showProject />) : <div className="card muted">Nada en la cola.</div>}</div>
          {diag?.gpu && <p className="small dim" style={{ marginTop: 10 }}>GPU {diag.gpu.name} · {Math.round(diag.gpu.vramMB / 1024)} GB VRAM · uso {diag.gpu.util}% · RAM {diag.ramGB} GB</p>}
        </div>
        <div>
          <h2>Últimos proyectos</h2>
          <div className="grid">
            {(projects ?? []).slice(0, 6).map((p) => (
              <a key={p.id} href={`#project/${p.id}`} className="card proj" style={{ textDecoration: "none", color: "inherit", padding: 12 }}>
                <div className="thumb" style={{ backgroundImage: p.thumb ? `url(${fileUrl(p.id, p.thumb)})` : undefined }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div className="small muted">{p.kind} · {p.lang?.toUpperCase()} · {fmtTime(p.duration)} · {p.videos?.length ?? 0} versiones</div>
                  <div style={{ marginTop: 6 }}><StatusPill s={p.status} /></div>
                </div>
              </a>
            ))}
            {projects && !projects.length && <div className="card muted">Aún no hay proyectos. Empieza con «Crear vídeo».</div>}
          </div>
        </div>
      </div>
    </>
  );
};
