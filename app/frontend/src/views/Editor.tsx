import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, fileUrl, fmtTime, STEPS } from "../api";
import { useData } from "../hooks";
import { JobRow, StatusPill } from "./common";

const ENV_LABEL: Record<string, string> = { village_square: "Plaza del pueblo", market: "Mercado", street: "Calle", park: "Parque", interior: "Interior (habitación / local)", harbour: "Puerto con faro" };
type Tab = "prod" | "story" | "script" | "video" | "audio" | "qa" | "versions";

export const Editor: React.FC<{ pid: string }> = ({ pid }) => {
  const [p, err, reload] = useData<any>(`/api/projects/${pid}`, 2500);
  const [opts] = useData<any>("/api/options");
  const [tab, setTab] = useState<Tab>("prod");
  const [msg, setMsg] = useState("");
  const [bust, setBust] = useState(String(Date.now()));
  const running = (p?.jobs ?? []).some((j: any) => j.status === "running" || j.status === "queued");
  const wasRunning = useRef(false);
  useEffect(() => { if (wasRunning.current && !running) setBust(String(Date.now())); wasRunning.current = running; }, [running]);
  if (err) return <div className="err">{err}</div>;
  if (!p) return <div className="muted">Cargando…</div>;
  const job = (kind: string, params: any = {}) => api.post(`/api/projects/${pid}/jobs`, { kind, params }).then(() => { setMsg(""); reload(); }).catch((e) => setMsg(e.message));
  const quality = p.quality || "standard";
  const steps = p.manifest?.steps ?? {};
  return (
    <>
      <div className="row" style={{ marginBottom: 6 }}>
        <div style={{ minWidth: 0 }}><h1>{p.title}</h1><p className="sub" style={{ marginBottom: 10 }}>{p.kind} · {p.lang?.toUpperCase()} · {p.style} · {fmtTime(p.duration)} · <StatusPill s={p.status} /></p></div>
        <span className="sp" />
        <button className="btn primary" disabled={running} onClick={() => job("produce", { quality })}>▶ Producir todo</button>
        <button className="btn" disabled={running || !p.storyboard} onClick={() => job("regen_scene", { quality })}>↻ Re-render solo lo cambiado</button>
      </div>
      {msg && <div className="err" style={{ marginBottom: 12 }}>{msg}</div>}
      <div className="tabs" role="tablist">
        {([["prod", "Producción"], ["story", "Storyboard / timeline"], ["script", "Guion"], ["video", "Vídeo y exportar"], ["audio", "Voz y audio"], ["qa", "Calidad"], ["versions", "Versiones"]] as [Tab, string][]).map(([k, l]) =>
          <button key={k} role="tab" className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === "prod" && <Production p={p} steps={steps} job={job} running={running} quality={quality} reload={reload} />}
      {tab === "story" && <Storyboard p={p} opts={opts} job={job} running={running} reload={reload} bust={bust} quality={quality} />}
      {tab === "script" && <ScriptEditor p={p} reload={reload} job={job} running={running} />}
      {tab === "video" && <VideoTab p={p} bust={bust} job={job} running={running} />}
      {tab === "audio" && <AudioTab p={p} opts={opts} job={job} running={running} reload={reload} bust={bust} />}
      {tab === "qa" && <QaTab p={p} bust={bust} reload={reload} job={job} running={running} />}
      {tab === "versions" && <Versions p={p} />}
    </>
  );
};

const Production: React.FC<any> = ({ p, steps, job, running, quality, reload }) => {
  const cur = p.jobs?.find((j: any) => j.status === "running");
  const plan = p.plan;
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)" }}>
      <div className="card">
        <h3>Pasos</h3>
        <div className="steps">
          {STEPS.map(([k, l], i) => {
            const done = k === "render" ? Object.keys(steps).some((s) => s.startsWith("render")) : !!steps[k];
            const isCur = cur && (cur.step === k || (k === "script" && !cur.step));
            const info = k === "render" ? steps[`render_${quality}`] : steps[k];
            return (
              <div key={k} className={`step ${done ? "done" : ""} ${isCur ? "cur" : ""}`}>
                <span className="dot">{done ? "✓" : i + 1}</span><span>{l}</span><span className="sp" />
                <span className="small dim">{info?.seconds ? `${info.seconds}s` : ""}{info?.renderedScenes ? ` · ${info.renderedScenes.length} esc. render, ${info.reusedScenes.length} reutil.` : ""}</span>
              </div>);
          })}
        </div>
        {p.status === "awaiting_review" && plan && (
          <div className="okbox" style={{ marginTop: 14 }}>El guion está listo para revisar ({plan.beats.length} escenas). Revísalo en «Guion» y pulsa «Producir todo».</div>
        )}
        <details className="adv"><summary>Ejecutar un paso concreto</summary>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn sm" disabled={running} onClick={() => job("plan")}>Escribir guion</button>
            <button className="btn sm" disabled={running || !plan} onClick={() => job("voice")}>Voz + storyboard</button>
            <button className="btn sm" disabled={running || !p.storyboard} onClick={() => job("stills")}>Fotogramas de control</button>
            <button className="btn sm" disabled={running || !p.storyboard} onClick={() => job("render", { quality: "draft" })}>Preview Draft</button>
            <button className="btn sm" disabled={running || !p.storyboard} onClick={() => job("render", { quality: "standard" })}>Render Standard</button>
            <button className="btn sm" disabled={running || !p.storyboard} onClick={() => job("render", { quality: "master" })}>Render Master 2K</button>
            <button className="btn sm" disabled={running || !p.storyboard} onClick={() => job("mix", { quality })}>Remezclar audio</button>
          </div>
        </details>
      </div>
      <div className="grid" style={{ alignContent: "start" }}>
        <h3 style={{ margin: 0 }}>Trabajos</h3>
        {(p.jobs ?? []).slice(0, 6).map((j: any) => <JobRow key={j.id} j={j} onChange={reload} />)}
        {!p.jobs?.length && <div className="card muted">Sin trabajos todavía. Pulsa «Producir todo».</div>}
        {p.jobs?.[0]?.log && <details className="adv"><summary>Registro del último trabajo</summary><pre className="log">{p.jobs[0].log}</pre></details>}
      </div>
    </div>
  );
};

const stillFor = (p: any, sc: any) => {
  const fr = (p.stills ?? []).map((f: string) => [f, Number(f.slice(2, 6))] as [string, number]).filter(([, n]: [string, number]) => n >= sc.startFrame && n < sc.endFrame);
  return fr.length ? fr[Math.floor(fr.length / 2)][0] : null;
};

const Storyboard: React.FC<any> = ({ p, opts, job, running, reload, bust, quality }) => {
  const sb = p.storyboard;
  const [sel, setSel] = useState(0);
  const [edit, setEdit] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [fut, setFut] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const beat = p.plan?.beats?.[sel];
  useEffect(() => { if (beat) setEdit(JSON.parse(JSON.stringify(beat))); }, [sel, p.plan]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!sb) return <div className="card muted">Aún no hay storyboard. Ejecuta «Producir todo» o «Voz + storyboard».</div>;
  const sc = sb.scenes[sel];
  const castIds = (p.plan?.cast ?? []).map((c: any) => c.id);
  const change = (k: string, v: any) => { setHist([...hist, edit]); setFut([]); setEdit({ ...edit, [k]: v }); };
  const undo = () => { if (!hist.length) return; setFut([edit, ...fut]); setEdit(hist[hist.length - 1]); setHist(hist.slice(0, -1)); };
  const redo = () => { if (!fut.length) return; setHist([...hist, edit]); setEdit(fut[0]); setFut(fut.slice(1)); };
  const save = async (regen: boolean) => {
    const r = await api.put(`/api/projects/${p.id}/beats/${sel}`, edit).catch((e) => { setNote(e.message); return null; });
    if (!r) return;
    setNote(r.needsVoice ? "Texto cambiado: se regenerará la voz y los tiempos; las escenas idénticas se reutilizan." : "Guardado.");
    if (regen) await job(r.needsVoice ? "produce" : "regen_scene", { quality });
    reload();
  };
  return (
    <div className="grid">
      <div className="timeline" aria-label="Timeline de escenas">
        {sb.scenes.map((s: any, i: number) => {
          const st = stillFor(p, s);
          const w = Math.max(70, Math.min(200, (s.endFrame - s.startFrame) / 2));
          return (
            <div key={s.sceneId} className={`tl ${i === sel ? "on" : ""}`} style={{ width: w }} onClick={() => setSel(i)}>
              {st ? <img src={fileUrl(p.id, `preview/${st}`, bust)} alt="" /> : <div style={{ aspectRatio: "9/16", background: "#0e0c12", borderRadius: 5 }} />}
              <div className="t">{s.sceneId} · {fmtTime(s.startFrame / sb.fps)}</div>
              <div className="t">{s.startFrame}–{s.endFrame} f</div>
            </div>);
        })}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,300px) minmax(0,1fr)" }}>
        <div className="card">
          <h3>Escena {sc.sceneId}</h3>
          {(() => { const st = stillFor(p, sc); return st ? <img src={fileUrl(p.id, `preview/${st}`, bust)} alt="" style={{ width: "100%", borderRadius: 10 }} /> : <div className="muted small">Sin fotograma (ejecuta Fotogramas de control).</div>; })()}
          <p className="small muted">Fotogramas {sc.startFrame}–{sc.endFrame} · {((sc.endFrame - sc.startFrame) / sb.fps).toFixed(2)} s · luz {sc.light} · {sc.cameraKeys.length} claves de cámara</p>
          <p className="small">{sc.narration}</p>
        </div>
        {edit && (
          <div className="card grid">
            <div className="row"><h3 style={{ margin: 0 }}>Inspector</h3><span className="sp" />
              <button className="btn sm" onClick={undo} disabled={!hist.length}>↶ Deshacer</button><button className="btn sm" onClick={redo} disabled={!fut.length}>↷ Rehacer</button></div>
            <label className="f">Locución de la escena<textarea value={edit.narration} onChange={(e) => change("narration", e.target.value)} /></label>
            <div className="grid g4">
              <label className="f">Plano<select value={edit.shot} onChange={(e) => change("shot", e.target.value)}>{opts?.shots.map((x: string) => <option key={x}>{x}</option>)}</select></label>
              <label className="f">Luz<select value={edit.light} onChange={(e) => change("light", e.target.value)}>{opts?.lights.map((x: string) => <option key={x}>{x}</option>)}</select></label>
              <label className="f">Música (ánimo)<select value={edit.mood} onChange={(e) => change("mood", e.target.value)}>{opts?.moods.map((x: string) => <option key={x}>{x}</option>)}</select></label>
              <label className="f">Transición<select value={edit.transition} onChange={(e) => change("transition", e.target.value)}>{["cut", "flash", "xfade"].map((x) => <option key={x}>{x}</option>)}</select></label>
            </div>
            <label className="f">Lugar de esta escena<select value={edit.environment ?? ""} onChange={(e) => change("environment", e.target.value)}>
              <option value="">(el del proyecto: {p.plan?.environment})</option>{(opts?.environments ?? []).map((x: string) => <option key={x} value={x}>{ENV_LABEL[x] ?? x}</option>)}</select></label>
            <h3>Personajes en escena</h3>
            {(edit.characters ?? []).map((c: any, i: number) => (
              <div key={i} className="row">
                <select value={c.id} onChange={(e) => { const cs = [...edit.characters]; cs[i] = { ...c, id: e.target.value }; change("characters", cs); }} style={{ maxWidth: 130 }}>{castIds.map((x: string) => <option key={x}>{x}</option>)}</select>
                <select value={c.action} onChange={(e) => { const cs = [...edit.characters]; cs[i] = { ...c, action: e.target.value }; change("characters", cs); }} style={{ maxWidth: 110 }}>{opts?.actions.map((x: string) => <option key={x}>{x}</option>)}</select>
                <select value={c.expr} onChange={(e) => { const cs = [...edit.characters]; cs[i] = { ...c, expr: e.target.value }; change("characters", cs); }} style={{ maxWidth: 130 }}>{opts?.expressions.map((x: string) => <option key={x}>{x}</option>)}</select>
                <input type="text" placeholder="reacciona en la palabra…" value={c.react?.word ?? ""} style={{ maxWidth: 170 }}
                  onChange={(e) => { const cs = [...edit.characters]; cs[i] = { ...c, react: e.target.value ? { word: e.target.value, expr: c.react?.expr ?? "shock" } : null }; change("characters", cs); }} />
                {c.react && <select value={c.react.expr} onChange={(e) => { const cs = [...edit.characters]; cs[i] = { ...c, react: { ...c.react, expr: e.target.value } }; change("characters", cs); }} style={{ maxWidth: 130 }}>{opts?.expressions.map((x: string) => <option key={x}>{x}</option>)}</select>}
                <button className="btn sm danger" onClick={() => change("characters", edit.characters.filter((_: any, k: number) => k !== i))}>✕</button>
              </div>))}
            <div className="row"><button className="btn sm" onClick={() => change("characters", [...(edit.characters ?? []), { id: castIds[0], action: "stand", expr: "neutral" }])}>+ Personaje</button>
              <label className="f" style={{ flexDirection: "row", alignItems: "center" }}>Foco<select value={edit.focus ?? ""} onChange={(e) => change("focus", e.target.value || null)} style={{ maxWidth: 140 }}><option value="">auto</option>{castIds.map((x: string) => <option key={x}>{x}</option>)}</select></label></div>
            <label className="f">Texto en pantalla (opcional)<input type="text" value={edit.text ?? ""} onChange={(e) => change("text", e.target.value || null)} /></label>
            {note && <div className="okbox">{note}</div>}
            <div className="row"><button className="btn" onClick={() => save(false)}>Guardar</button>
              <button className="btn primary" disabled={running} onClick={() => save(true)}>Guardar y regenerar esta escena</button>
              <span className="small muted">Solo se re-renderizan las escenas cuyo contenido cambió.</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScriptEditor: React.FC<any> = ({ p, reload, job, running }) => {
  const [txt, setTxt] = useState(() => (p.plan ? JSON.stringify(p.plan, null, 1) : ""));
  const [note, setNote] = useState("");
  const [claude, setClaude] = useState("");
  const save = () => api.put(`/api/projects/${p.id}/plan`, JSON.parse(txt)).then(() => { setNote("Guion guardado y validado (versión guardada)."); reload(); }).catch((e) => setNote("Error: " + e.message));
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
      <div className="card grid">
        <h3>Guion por escenas</h3>
        {p.plan ? p.plan.beats.map((b: any, i: number) => <div key={i} className="small"><b>{i + 1}.</b> <span className="dim">[{b.shot}/{b.light}]</span> {b.narration}</div>) : <div className="muted">Sin guion todavía.</div>}
        {p.plan?.verifiedClaims?.length > 0 && <><h3>Hechos (FACTS.md)</h3>{p.plan.verifiedClaims.map((c: any, i: number) => <div key={i} className="small"><span className={`pill ${c.status === "verified" ? "ok" : c.status === "fiction" ? "" : "warn"}`}>{c.status}</span> {c.text} {c.source && <a href={c.source} target="_blank" rel="noreferrer">fuente</a>}</div>)}</>}
        <div className="row"><button className="btn" disabled={running} onClick={() => job("plan")}>Reescribir guion con IA local</button>
          <button className="btn" onClick={() => api.get(`/api/projects/${p.id}/claude-prompt`).then((r) => setClaude(r.prompt))}>Preparar prompt para Claude</button></div>
        {claude && <><p className="small muted">Copia este texto en Claude (Claude Code o claude.ai), pega el JSON que te devuelva en el editor de la derecha y guarda. No se usa ninguna API ni credencial.</p>
          <textarea readOnly value={claude} style={{ minHeight: 200, fontSize: 12 }} onFocus={(e) => e.target.select()} /></>}
      </div>
      <div className="card grid">
        <h3>Plan JSON (editable, validado al guardar)</h3>
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)} style={{ minHeight: 480, fontFamily: "Consolas, monospace", fontSize: 12 }} spellCheck={false} />
        {note && <div className={note.startsWith("Error") ? "err" : "okbox"}>{note}</div>}
        <div className="row"><button className="btn primary" onClick={save}>Guardar guion</button><span className="small muted">Después: «Producir todo» (voz nueva si cambió el texto).</span></div>
      </div>
    </div>
  );
};

const VideoTab: React.FC<any> = ({ p, bust }) => {
  const [v, setV] = useState<string | null>(null);
  const vids: string[] = p.videos ?? [];
  const cur = v ?? vids[vids.length - 1];
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,380px) minmax(0,1fr)" }}>
      <div>{cur ? <video key={cur} className="player" src={fileUrl(p.id, `output/${cur}`, bust)} controls playsInline /> : <div className="card muted">Aún no hay vídeo final.</div>}</div>
      <div className="grid" style={{ alignContent: "start" }}>
        <div className="card">
          <h3>Versiones exportadas</h3>
          {vids.slice().reverse().map((f) => <div key={f} className="row small" style={{ marginBottom: 6 }}>
            <button className={`btn sm ${f === cur ? "primary" : ""}`} onClick={() => setV(f)}>Ver</button><span>{f}</span><span className="sp" /><a className="btn sm" href={fileUrl(p.id, `output/${f}`)} download>Descargar</a></div>)}
        </div>
        <div className="card">
          <h3>Exportar paquete</h3>
          <p className="small muted">MP4 H.264 + AAC 48 kHz, voz limpia (WAV), mezcla WAV, subtítulos SRT, guion, FACTS, storyboard JSON, informe de calidad y póster.</p>
          <div className="row">{["standard", "master", "draft"].map((q) => <a key={q} className="btn" href={`/api/projects/${p.id}/export.zip?quality=${q}`}>ZIP {q}</a>)}</div>
          <p className="small dim">Los vídeos están en: projects/{p.id}/output/. No se publica nada automáticamente.</p>
        </div>
      </div>
    </div>
  );
};

const Wave: React.FC<{ url: string }> = ({ url }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    fetch(url).then((r) => r.arrayBuffer()).then((b) => new AudioContext().decodeAudioData(b)).then((buf) => {
      if (!alive || !ref.current) return;
      const c = ref.current, g = c.getContext("2d")!, d = buf.getChannelData(0), W = (c.width = c.clientWidth * 2), H = (c.height = 92);
      g.fillStyle = "#e0794f"; const step = Math.floor(d.length / W);
      for (let x = 0; x < W; x++) { let m = 0; for (let i = 0; i < step; i += 8) m = Math.max(m, Math.abs(d[x * step + i])); g.fillRect(x, H / 2 - m * H / 2, 1, Math.max(1, m * H)); }
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [url]);
  return <canvas ref={ref} className="wave" />;
};

const AudioTab: React.FC<any> = ({ p, opts, job, running, reload, bust }) => {
  const [voice, setVoice] = useState(p.manifest?.steps?.voice?.voice ?? "");
  const [speed, setSpeed] = useState(p.manifest?.steps?.voice?.speed ?? 1.0);
  const [musicDb, setMusicDb] = useState(-10);
  const [music, setMusic] = useState(true);
  const [note, setNote] = useState("");
  const m = p.mix?.measured;
  const upload = async (f: File) => { const fd = new FormData(); fd.append("file", f); try { const r = await api.upload(`/api/projects/${p.id}/voice`, fd); setNote(`Voz importada (${r.duration.toFixed(1)} s). Pulsa «Voz + storyboard». ${r.note}`); reload(); } catch (e: any) { setNote("Error: " + e.message); } };
  return (
    <div className="grid g2">
      <div className="card grid">
        <h3>Voz (Kokoro local)</h3>
        <div className="grid g2">
          <label className="f">Narrador<select value={voice} onChange={(e) => setVoice(e.target.value)}><option value="">Por defecto</option>{(opts?.voices?.[p.lang] ?? []).map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label className="f">Velocidad<input type="number" step={0.05} min={0.8} max={1.3} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label>
        </div>
        <div className="row"><button className="btn primary" disabled={running} onClick={() => job("voice", { voice: voice || undefined, speed })}>Generar voz + tiempos</button></div>
        <label className="f">…o importar tu propia locución (WAV/MP3; solo voces tuyas o con permiso)<input type="file" accept=".wav,.mp3" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
        {note && <div className={note.startsWith("Error") ? "err" : "okbox"}>{note}</div>}
        {p.manifest?.steps?.voice && <audio controls src={fileUrl(p.id, "audio/voice.wav", bust)} style={{ width: "100%" }} />}
        {p.words && <p className="small muted">{p.words.length} palabras con tiempo · método {JSON.stringify(p.manifest?.steps?.align?.method)} · editable en audio/words.manual.json</p>}
      </div>
      <div className="card grid">
        <h3>Mezcla</h3>
        {p.mix && <><Wave url={fileUrl(p.id, "audio/mix.wav", bust)} /><audio controls src={fileUrl(p.id, "audio/mix.wav", bust)} style={{ width: "100%" }} /></>}
        {m && <table><tbody>
          <tr><td>Integrado</td><td><b>{m.integratedLUFS} LUFS</b> (objetivo −14)</td></tr><tr><td>Pico real</td><td><b>{m.truePeakDBTP} dBTP</b> (WAV; el MP4 se verifica tras AAC)</td></tr>
          <tr><td>Voz / música / SFX</td><td>{m.voiceLUFS} / {m.musicLUFS ?? "—"} / {m.sfxLUFS} LUFS</td></tr><tr><td>LRA</td><td>{m.LRA} LU</td></tr>
          <tr><td>ffmpeg ebur128</td><td>{JSON.stringify(p.mix.ffmpegEbur128)}</td></tr></tbody></table>}
        <div className="grid g2">
          <label className="f">Música bajo la voz (dB)<input type="number" value={musicDb} step={1} min={-24} max={-4} onChange={(e) => setMusicDb(Number(e.target.value))} /></label>
          <label className="row small" style={{ marginTop: 24 }}><input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} /> Música activada</label>
        </div>
        <button className="btn" disabled={running || !p.storyboard} onClick={() => job("mix", { music, musicDb, quality: p.quality || "standard" })}>Remezclar y volver a exportar</button>
        {p.mix && <details className="adv"><summary>Cues de música y efectos</summary><pre className="log">{[...(p.mix.musicCues ?? []), ...(p.mix.sfxCues ?? []).map((c: any) => `${c.t}s ${c.kind}: ${c.what}`)].join("\n")}</pre></details>}
      </div>
    </div>
  );
};

const AREAS = ["Comprensión narrativa y gancho inicial", "Coherencia de personajes y escenarios", "Cámara y pacing", "Contornos / ilustración / materiales", "Iluminación, color y profundidad",
  "Claridad y naturalidad de la voz", "SFX, música y sincronía", "Composición vertical y safe areas", "Alineación visual-texto"];

const QaTab: React.FC<any> = ({ p, bust, reload, job, running }) => {
  const q = p.qa;
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [note, setNote] = useState("");
  const send = (approved: boolean) => api.post(`/api/projects/${p.id}/review`, { approved, scores, notes, video: p.videos?.[p.videos.length - 1] }).then(() => { setNote(approved ? "Aprobado." : "Cambios registrados."); reload(); }).catch((e) => setNote("Error: " + e.message));
  if (!q) return <div className="card muted">Aún no hay informe de calidad. <button className="btn sm" disabled={running} onClick={() => job("qa")}>Ejecutar QA</button></div>;
  return (
    <div className="grid">
      <div className="row"><span className={`pill ${q.technicalPass ? "ok" : "bad"}`}>Técnico: {q.technicalPass ? "PASA" : "FALLA"}</span>
        <span className={`pill ${q.approved ? "ok" : "warn"}`}>{q.approved ? "Aprobado por una persona" : "Revisión humana pendiente"}</span>
        <span className="small muted">{q.probe.width}×{q.probe.height} · {q.probe.fps} fps · {q.probe.videoSeconds.toFixed(2)} s · {q.probe.sizeMB} MB · {q.loudness.I} LUFS · TP {q.loudness.TP} dBTP</span></div>
      <div className="grid g2">
        <div className="card" style={{ padding: 0 }}><table><thead><tr><th>Comprobación medida</th><th></th><th>Detalle</th></tr></thead><tbody>
          {q.checks.map((c: any) => <tr key={c.check}><td>{c.check}{c.blocking ? "" : <span className="dim small"> (aviso)</span>}</td><td>{c.ok ? "✅" : c.blocking ? "❌" : "⚠️"}</td><td className="small muted">{c.detail}</td></tr>)}
        </tbody></table></div>
        <div className="card grid" style={{ alignContent: "start" }}>
          <h3>Revisión humana (0–10)</h3>
          <p className="small muted" style={{ margin: 0 }}>Estas áreas no se puntúan automáticamente (no hay visión artificial fiable aquí). Mira el vídeo y los fotogramas.</p>
          {AREAS.map((a) => <div key={a} className="row small"><span style={{ flex: 1 }}>{a}</span><input type="number" min={0} max={10} style={{ width: 70 }} value={scores[a] ?? ""} onChange={(e) => setScores({ ...scores, [a]: Number(e.target.value) })} /></div>)}
          <textarea placeholder="Notas: qué escena y qué fotograma corregir…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          {note && <div className={note.startsWith("Error") ? "err" : "okbox"}>{note}</div>}
          <div className="row"><button className="btn primary" onClick={() => send(true)}>Aprobar calidad</button><button className="btn" onClick={() => send(false)}>Pedir cambios</button></div>
        </div>
      </div>
      <div className="card"><h3>Fotogramas del vídeo final (mitad de cada escena)</h3><img className="sheet" src={fileUrl(p.id, "qa/final_contact_sheet.jpg", bust)} alt="contact sheet" /></div>
      <div className="card"><h3>Fotogramas de control (inicio / mitad / final de escena)</h3><img className="sheet" src={fileUrl(p.id, "preview/contact_sheet.jpg", bust)} alt="stills" /></div>
      <div className="card" style={{ padding: 0 }}><table><thead><tr><th>Escena</th><th>Luz</th><th>Luma mediana</th><th>p5</th><th>p95</th><th>Saturación</th></tr></thead><tbody>
        {q.sceneStats.map((s: any) => <tr key={s.scene}><td>{s.scene}</td><td>{s.light}</td><td>{s.medianLuma}</td><td>{s.p5Luma}</td><td>{s.p95Luma}</td><td>{s.satMean}</td></tr>)}</tbody></table></div>
    </div>
  );
};

const Versions: React.FC<any> = ({ p }) => (
  <div className="card"><h3>Instantáneas de guion y storyboard</h3>
    {(p.versions ?? []).map((v: string) => <div key={v} className="row small" style={{ marginBottom: 4 }}><span>{v}</span><span className="sp" /><a className="btn sm" href={fileUrl(p.id, `versions/${v}`)} target="_blank" rel="noreferrer">Abrir</a></div>)}
    <h3 style={{ marginTop: 18 }}>Historial</h3>
    <pre className="log">{(p.manifest?.history ?? []).map((h: any) => `${h.at}  ${h.step}  ${h.seconds ?? ""}`).join("\n")}</pre>
    <h3>Reseñas</h3>
    {(p.reviews ?? []).map((r: any) => <div key={r.id} className="small">{r.created} · {r.approved ? "aprobado" : "cambios"} · {r.notes}</div>)}
  </div>
);
