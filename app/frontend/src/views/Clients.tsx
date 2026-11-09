import React, { useState } from "react";
import { api } from "../api";
import { useData } from "../hooks";

const EMPTY = { name: "", primary: "#c8553d", secondary: "#f2c94c", text: "#ffffff", tagline: "", font: "", cta: "", claims: "", notes: "" };

export const Clients: React.FC = () => {
  const [list, , reload] = useData<any[]>("/api/clients");
  const [f, setF] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const save = async () => {
    const body = { ...f, tagline: f.tagline || null, font: f.font || null, cta: f.cta || null, notes: f.notes || null, claims: f.claims.split("\n").map((x: string) => x.trim()).filter(Boolean) };
    try { editing ? await api.put(`/api/clients/${editing}`, body) : await api.post("/api/clients", body); setNote("Guardado."); setF(EMPTY); setEditing(null); reload(); }
    catch (e: any) { setNote("Error: " + e.message); }
  };
  return (
    <>
      <h1>Clientes y marcas</h1>
      <p className="sub">Cada cliente tiene su kit de marca y su biblioteca aislada. Los anuncios solo usan las afirmaciones que apruebes aquí.</p>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <div className="card grid">
          <h3>{editing ? "Editar cliente" : "Nuevo cliente"}</h3>
          <label className="f">Nombre comercial<input type="text" value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
          <div className="grid g3">
            {[["primary", "Color principal"], ["secondary", "Secundario"], ["text", "Texto"]].map(([k, l]) => <label key={k} className="f">{l}<input type="color" value={f[k]} onChange={(e) => set(k, e.target.value)} style={{ width: "100%", height: 38 }} /></label>)}
          </div>
          <label className="f">Lema (sale en el cartel)<input type="text" value={f.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
          <label className="f">CTA por defecto<input type="text" value={f.cta} onChange={(e) => set("cta", e.target.value)} /></label>
          <label className="f">Afirmaciones aprobadas (una por línea; nada más se afirmará)<textarea value={f.claims} onChange={(e) => set("claims", e.target.value)} /></label>
          <label className="f">Notas<textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} /></label>
          {note && <div className={note.startsWith("Error") ? "err" : "okbox"}>{note}</div>}
          <div className="row"><button className="btn primary" disabled={!f.name.trim()} onClick={save}>Guardar</button>{editing && <button className="btn" onClick={() => { setF(EMPTY); setEditing(null); }}>Cancelar</button>}</div>
          <p className="small dim">Logos y fotos de producto: Biblioteca → Importar, eligiendo este cliente.</p>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          {(list ?? []).map((c) => (
            <div key={c.id} className="card">
              <div className="row"><span className="swatch" style={{ background: c.primary_color }} /><span className="swatch" style={{ background: c.secondary_color }} /><b>{c.name}</b><span className="sp" />
                <button className="btn sm" onClick={() => { setEditing(c.id); setF({ name: c.name, primary: c.primary_color, secondary: c.secondary_color, text: c.text_color, tagline: c.tagline ?? "", font: c.font ?? "", cta: c.cta ?? "", claims: (c.claims ?? []).join("\n"), notes: c.notes ?? "" }); }}>Editar</button></div>
              {c.tagline && <div className="small muted">«{c.tagline}»</div>}
              <div className="small" style={{ marginTop: 6 }}>{(c.claims ?? []).map((x: string, i: number) => <div key={i}>✓ {x}</div>)}</div>
              <div className="small dim" style={{ marginTop: 6 }}>{c.assets?.length ?? 0} assets propios</div>
            </div>))}
          {list && !list.length && <div className="card muted">Sin clientes. Los proyectos pueden ir como «Proyecto sin cliente».</div>}
        </div>
      </div>
    </>
  );
};
