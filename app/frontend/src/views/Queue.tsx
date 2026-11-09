import React from "react";
import { useData } from "../hooks";
import { JobRow } from "./common";

export const Queue: React.FC = () => {
  const [jobs, , reload] = useData<any[]>("/api/jobs?limit=80", 1500);
  const live = (jobs ?? []).filter((j) => j.status === "running" || j.status === "queued");
  const past = (jobs ?? []).filter((j) => !(j.status === "running" || j.status === "queued"));
  return (
    <>
      <h1>Cola de render</h1>
      <p className="sub">Un trabajo a la vez: la GPU nunca carga render, voz y transcripción al mismo tiempo. Cancelar detiene también los procesos hijos.</p>
      <h2>Activos ({live.length})</h2>
      <div className="grid" style={{ marginBottom: 22 }}>{live.length ? live.map((j) => <JobRow key={j.id} j={j} onChange={reload} showProject />) : <div className="card muted">Cola vacía.</div>}</div>
      <h2>Historial</h2>
      <div className="grid">{past.map((j) => <JobRow key={j.id} j={j} onChange={reload} showProject />)}</div>
    </>
  );
};
