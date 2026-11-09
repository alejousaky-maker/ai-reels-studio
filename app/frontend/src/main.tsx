import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Dashboard } from "./views/Dashboard";
import { Create } from "./views/Create";
import { Projects } from "./views/Projects";
import { Editor } from "./views/Editor";
import { Queue } from "./views/Queue";
import { Library } from "./views/Library";
import { Clients } from "./views/Clients";
import { Settings } from "./views/Settings";

const NAV: [string, string, string][] = [
  ["dashboard", "◧", "Panel"], ["create", "✚", "Crear vídeo"], ["projects", "▤", "Proyectos"], ["queue", "⧗", "Cola de render"],
  ["library", "❖", "Biblioteca"], ["clients", "◎", "Clientes / marcas"], ["settings", "⚙", "Ajustes y diagnóstico"],
];

export const go = (h: string) => { window.location.hash = h; };
const useHash = () => {
  const [h, setH] = useState(window.location.hash.slice(1) || "dashboard");
  useEffect(() => { const f = () => setH(window.location.hash.slice(1) || "dashboard"); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  return h;
};

const App: React.FC = () => {
  const h = useHash();
  const [view, arg] = h.split("/");
  const page = view === "create" ? <Create /> : view === "projects" ? <Projects /> : view === "project" ? <Editor pid={arg} key={arg} /> : view === "queue" ? <Queue />
    : view === "library" ? <Library /> : view === "clients" ? <Clients /> : view === "settings" ? <Settings /> : <Dashboard />;
  return (
    <div className="app">
      <aside className="side" aria-label="Navegación">
        <div className="brand"><span className="logo">▶</span> AI Reels Studio</div>
        {NAV.map(([k, ic, l]) => (
          <a key={k} href={`#${k}`} className={`nav ${view === k || (k === "projects" && view === "project") ? "on" : ""}`}><span className="ic">{ic}</span>{l}</a>
        ))}
        <div className="foot">Local · 127.0.0.1 · sin cuentas<br />Nada se publica sin tu acción.</div>
      </aside>
      <main>{page}</main>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
