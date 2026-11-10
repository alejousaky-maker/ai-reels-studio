// AI Reels Studio render CLI (called by the backend; also usable by hand).
//   node scripts/engine.mjs stills <storyboard.json> <outPrefix> <f1,f2,...> [scale=0.5]
//   node scripts/engine.mjs render <storyboard.json> <out.mp4> [--scale 1] [--crf 18] [--frames a-b] [--concurrency n]
// Prints one JSON object per line on stdout: {"event":"progress","progress":0.42,...} / {"event":"done",...} / {"event":"error",...}
// The bundle is cached per source hash under <root>/work/bundles, temp files go to <root>/work/remotion-tmp
// (never the shared system TEMP: every bundle copies public/ and Remotion never deletes it).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const ENGINE = path.resolve(here, "..");
const ROOT = path.resolve(ENGINE, "..", "..");
const TMP = process.env.REMOTION_TMP || path.join(ROOT, "work", "remotion-tmp");
fs.mkdirSync(TMP, { recursive: true });
process.env.TEMP = process.env.TMP = process.env.TMPDIR = TMP;
const { bundle } = await import("@remotion/bundler");
const { renderStill, renderMedia, selectComposition } = await import("@remotion/renderer");

const out = (o) => process.stdout.write(JSON.stringify(o) + "\n");
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };

const hashDir = (dir, h) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) hashDir(p, h); else { h.update(p.slice(ENGINE.length)); h.update(fs.readFileSync(p)); }
  }
};
const getBundle = async () => {
  const h = crypto.createHash("sha256");
  hashDir(path.join(ENGINE, "src"), h);
  for (const f of fs.readdirSync(path.join(ENGINE, "public"), { recursive: true })) h.update(String(f));
  const key = h.digest("hex").slice(0, 16), dir = path.join(ROOT, "work", "bundles", key);
  if (fs.existsSync(path.join(dir, "index.html"))) return dir;
  out({ event: "log", message: `bundling engine (${key})...` });
  const t0 = Date.now();
  await bundle({ entryPoint: path.join(ENGINE, "src", "index.ts"), publicDir: path.join(ENGINE, "public"), outDir: dir });
  out({ event: "log", message: `bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)} s` });
  return dir;
};

const chromiumOptions = { gl: process.env.AIRS_GL || "angle" };
const browserExecutable = process.env.CHROME || null;
const onBrowserLog = (l) => { if (l.type === "error") out({ event: "browser", level: l.type, text: l.text.slice(0, 300) }); };

try {
  const [mode, sbPath] = args;
  if (!mode || !sbPath) throw new Error("usage: engine.mjs stills|render <storyboard.json> ...");
  const storyboard = JSON.parse(fs.readFileSync(sbPath, "utf8"));
  const inputProps = { storyboard };
  const serveUrl = await getBundle();
  const composition = await selectComposition({ serveUrl, id: "StoryShort", inputProps, browserExecutable, chromiumOptions, onBrowserLog });
  if (mode === "stills") {
    const prefix = args[2], frames = args[3].split(",").map(Number), scale = Number(args[4] ?? "0.5"), png = args[5] === "png";
    fs.mkdirSync(path.dirname(path.resolve(prefix + "x")), { recursive: true });
    for (const f of frames) {
      const t0 = Date.now(), file = path.resolve(`${prefix}${String(f).padStart(4, "0")}.${png ? "png" : "jpg"}`);
      await renderStill({ serveUrl, composition, inputProps, frame: Math.min(f, composition.durationInFrames - 1), output: file, scale,
        imageFormat: png ? "png" : "jpeg", ...(png ? {} : { jpegQuality: 92 }),
        browserExecutable, chromiumOptions, onBrowserLog, timeoutInMilliseconds: 180000 });
      out({ event: "still", frame: f, file, seconds: (Date.now() - t0) / 1000 });
    }
    out({ event: "done" });
  } else if (mode === "render") {
    const file = path.resolve(args[2]);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const scale = Number(flag("--scale", "1")), crf = Number(flag("--crf", "18"));
    const fr = flag("--frames", null), frameRange = fr ? fr.split("-").map(Number) : null;
    const memGB = os.totalmem() / 2 ** 30;
    const concurrency = Number(flag("--concurrency", String(Math.max(1, Math.min(4, Math.floor(memGB / 8))))));
    const t0 = Date.now();
    let last = -1;
    await renderMedia({ serveUrl, composition, inputProps, codec: "h264", crf, scale, outputLocation: file, concurrency, frameRange,
      imageFormat: "jpeg", jpegQuality: 92, pixelFormat: "yuv420p", browserExecutable, chromiumOptions, onBrowserLog, timeoutInMilliseconds: 240000,
      onProgress: ({ progress, renderedFrames, encodedFrames }) => {
        const p = Math.floor(progress * 100);
        if (p !== last) { last = p; out({ event: "progress", progress, renderedFrames, encodedFrames, elapsed: (Date.now() - t0) / 1000 }); }
      } });
    const secs = (Date.now() - t0) / 1000, n = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
    out({ event: "done", file, seconds: secs, frames: n, fps: n / secs, concurrency });
  } else throw new Error(`unknown mode ${mode}`);
} catch (e) {
  out({ event: "error", message: String(e?.stack || e).slice(0, 2000) });
  process.exit(1);
}
