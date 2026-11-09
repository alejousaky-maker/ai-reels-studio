import React, { useState } from "react";
import { api } from "../api";
import { useData } from "../hooks";

export const Library: React.FC = () => {
  const [lib, , reload] = useData<any>("/api/library");
  const [clients] = useData<any[]>("/api/clients");
  const [up, setUp] = useState({ license: "", source: "", clientId: "" });
  const [note, setNote] = useState("");
  const upload = async (f: File) => {
    const fd = new FormData(); fd.append("file", f); fd.append("license", up.license); fd.append("source", up.source); fd.append("clientId", up.clientId);
    try { const r = await api.upload("/api/assets", fd); setNote(`Importado (${r.kind}, ${(r.size / 1024).toFixed(0)} KB, sha256 ${r.sha256.slice(0, 12)}…)`); reload(); } catch (e: any) { setNote("Error: " + e.message); }
  };
  if (!lib) return <div className="muted">Cargando…</div>;
  const Sec: React.FC<{ t: string; rows: any[]; cols: [string, string][] }> = ({ t, rows, cols }) => (
    <div className="card" style={{ padding: 0 }}><h3 style={{ padding: "14px 14px 0" }}>{t} ({rows.length})</h3>
      <table><thead><tr>{cols.map(([, l]) => <th key={l}>{l}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{cols.map(([k]) => <td key={k} className="small">{String(r[k] ?? "")}</td>)}</tr>)}</tbody></table></div>);
  return (
    <>
      <h1>Biblioteca</h1>
      <p className="sub">Todo lo que el motor puede usar, con licencia y procedencia. Los archivos importados se validan (tipo, contenido, tamaño) y nunca se ejecutan como código.</p>
      <div className="card grid" style={{ marginBottom: 16 }}>
        <h3>Importar asset (PNG, JPG, SVG, WAV, MP3, MP4, GLB, GLTF, TTF, OTF)</h3>
        <div className="grid g3">
          <label className="f">Licencia / derechos (obligatorio)<input type="text" value={up.license} onChange={(e) => setUp({ ...up, license: e.target.value })} placeholder="propio, CC0, licencia del cliente…" /></label>
          <label className="f">Procedencia<input type="text" value={up.source} onChange={(e) => setUp({ ...up, source: e.target.value })} placeholder="URL o «creado por…»" /></label>
          <label className="f">Cliente (biblioteca aislada)<select value={up.clientId} onChange={(e) => setUp({ ...up, clientId: e.target.value })}><option value="">General</option>{(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        </div>
        <input type="file" disabled={!up.license.trim()} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {note && <div className={note.startsWith("Error") ? "err" : "okbox"}>{note}</div>}
      </div>
      <div className="grid g2">
        <Sec t="Personajes originales" rows={lib.characters} cols={[["role", "Rol"], ["license", "Licencia"], ["source", "Origen"]]} />
        <Sec t="Escenarios" rows={lib.environments} cols={[["name", "Nombre"], ["license", "Licencia"]]} />
        <Sec t="Modelos 3D" rows={lib.models} cols={[["name", "Modelo"], ["license", "Licencia"], ["source", "Fuente"]]} />
        <Sec t="Iconos / productos / FX" rows={lib.products} cols={[["name", "Nombre"], ["license", "Licencia"]]} />
        <Sec t="Música" rows={lib.music} cols={[["mood", "Ánimo"], ["bpm", "BPM"], ["license", "Licencia"]]} />
        <Sec t="SFX" rows={lib.sfx} cols={[["name", "Nombre"], ["license", "Licencia"]]} />
        <Sec t="Voces" rows={lib.voices} cols={[["label", "Voz"], ["lang", "Idioma"], ["license", "Licencia"]]} />
        <Sec t="Importados" rows={lib.uploaded} cols={[["filename", "Archivo"], ["kind", "Tipo"], ["client_id", "Cliente"], ["license", "Licencia"], ["source", "Procedencia"]]} />
      </div>
    </>
  );
};
