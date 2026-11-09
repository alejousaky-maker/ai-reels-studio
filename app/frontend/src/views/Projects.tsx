import React, { useState } from "react";
import { useData } from "../hooks";
import { api, fileUrl, fmtTime } from "../api";
import { StatusPill } from "./common";

export const Projects: React.FC = () => {
  const [archived, setArchived] = useState(0);
  const [list, , reload] = useData<any[]>(`/api/projects?archived=${archived}`, 5000);
  const [clients] = useData<any[]>("/api/clients");
  const [flt, setFlt] = useState({ q: "", kind: "", lang: "", status: "", client: "" });
  const rows = (list ?? []).filter((p) => (!flt.q || p.title.toLowerCase().includes(flt.q.toLowerCase())) && (!flt.kind || p.kind === flt.kind)
    && (!flt.lang || p.lang === flt.lang) && (!flt.status || p.status === flt.status) && (!flt.client || p.client_id === flt.client));
  return (
    <>
      <div className="row"><div><h1>Proyectos</h1><p className="sub">Historial con filtros. Duplica un proyecto para crear variantes sin rehacer todo.</p></div><span className="sp" />
        <button className="btn" onClick={() => setArchived(archived ? 0 : 1)}>{archived ? "Ver activos" : "Ver archivados"}</button></div>
      <div className="card row" style={{ marginBottom: 14 }}>
        <input type="text" placeholder="Buscar…" value={flt.q} onChange={(e) => setFlt({ ...flt, q: e.target.value })} style={{ maxWidth: 260 }} />
        <select value={flt.kind} onChange={(e) => setFlt({ ...flt, kind: e.target.value })} style={{ maxWidth: 160 }}><option value="">Todos los tipos</option><option value="story">Historia</option><option value="explainer">Explicador</option><option value="ad">Anuncio</option></select>
        <select value={flt.lang} onChange={(e) => setFlt({ ...flt, lang: e.target.value })} style={{ maxWidth: 130 }}><option value="">Idioma</option><option value="en">EN</option><option value="es">ES</option></select>
        <select value={flt.status} onChange={(e) => setFlt({ ...flt, status: e.target.value })} style={{ maxWidth: 170 }}><option value="">Estado</option>{["draft", "running", "awaiting_review", "done", "qa_failed", "approved"].map((s) => <option key={s}>{s}</option>)}</select>
        <select value={flt.client} onChange={(e) => setFlt({ ...flt, client: e.target.value })} style={{ maxWidth: 180 }}><option value="">Cliente</option>{(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Idioma</th><th>Duración</th><th>Versiones</th><th>Actualizado</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><div className="thumb" style={{ width: 40, backgroundImage: p.thumb ? `url(${fileUrl(p.id, p.thumb)})` : undefined }} /></td>
                <td><a href={`#project/${p.id}`}><b>{p.title}</b></a>{p.parent_id && <div className="small dim">copia de {p.parent_id}</div>}</td>
                <td>{p.kind}</td><td>{p.lang?.toUpperCase()}</td><td>{fmtTime(p.duration)}</td><td>{p.videos?.length ?? 0}</td>
                <td className="small muted">{p.updated?.replace("T", " ")}</td><td><StatusPill s={p.status} /></td>
                <td className="row" style={{ flexWrap: "nowrap" }}>
                  <button className="btn sm" onClick={() => api.post(`/api/projects/${p.id}/duplicate`).then(reload)}>Duplicar</button>
                  <button className="btn sm" onClick={() => api.patch(`/api/projects/${p.id}`, { archived: archived ? 0 : 1 }).then(reload)}>{archived ? "Restaurar" : "Archivar"}</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={9} className="muted">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
};
