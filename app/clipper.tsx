"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Clip = {
  title?: string;
  video_title_for_youtube_short?: string;
  video_url?: string;
  download_url?: string;
  start?: number;
  end?: number;
};

type StatusPayload = {
  status?: string;
  logs?: string[];
  result?: { clips?: Clip[] };
  clips?: Clip[];
  error?: string;
  detail?: string;
};

function normalizeClipUrl(value?: string) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://api.openshorts.app${value.startsWith("/") ? "" : "/"}${value}`;
}

function getErrorMessage(data: any, fallback: string): string {
  const obj = data?.error || data?.detail;
  if (!obj) return fallback;
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    if (obj.minutes_required !== undefined && obj.minutes_remaining !== undefined) {
      return `Saldo menit tidak cukup. Butuh ${obj.minutes_required} menit, sisa ${obj.minutes_remaining} menit.`;
    }
    return obj.error || obj.message || obj.detail || JSON.stringify(obj);
  }
  return fallback;
}

export default function Clipper({ username }: { username: string }) {
  const [url, setUrl] = useState("");
  const [ownsRights, setOwnsRights] = useState(false);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("idle");
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const clips = useMemo(() => {
    return payload?.result?.clips || payload?.clips || [];
  }, [payload]);

  useEffect(() => {
    if (!jobId || ["completed", "failed"].includes(status)) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/status/${encodeURIComponent(jobId)}`, { cache: "no-store" });
        const data: StatusPayload = await res.json();
        if (stopped) return;

        if (!res.ok) {
          setMessage(getErrorMessage(data, "Gagal mengambil status proses."));
          timer = setTimeout(checkStatus, 10000);
          return;
        }

        setPayload(data);
        const next = data.status || "processing";
        setStatus(next);

        if (!["completed", "failed"].includes(next)) {
          timer = setTimeout(checkStatus, 8000);
        }
      } catch {
        if (!stopped) timer = setTimeout(checkStatus, 12000);
      }
    }

    checkStatus();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, status]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setPayload(null);
    setJobId("");

    if (!url.trim()) {
      setMessage("Masukkan URL video terlebih dahulu.");
      return;
    }
    if (!ownsRights) {
      setMessage("Konfirmasi bahwa kamu berhak memproses video tersebut.");
      return;
    }

    setSubmitting(true);
    setStatus("starting");
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), acknowledged: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setMessage(getErrorMessage(data, "Gagal memulai proses video."));
        return;
      }

      const id = data.job_id || data.id;
      if (!id) {
        setStatus("idle");
        setMessage("OpenShorts tidak mengembalikan Job ID.");
        return;
      }

      setJobId(id);
      setStatus(data.status || "queued");
      setMessage("Video masuk antrean. TokoClip akan mengecek hasil secara otomatis.");
    } catch {
      setStatus("idle");
      setMessage("Tidak dapat terhubung ke server TokoClip.");
    } finally {
      setSubmitting(false);
    }
  }

  const progressLabel =
    status === "queued" ? "Menunggu antrean" :
    status === "processing" || status === "starting" ? "Sedang membuat clip" :
    status === "completed" ? "Selesai" :
    status === "failed" ? "Gagal" : "Siap";

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#">TokoClip<span>.</span></a>
        <div className="nav-actions">
          <span className="user-pill">{username}</span>
          <button
            className="logout-button"
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
          >
            Keluar
          </button>
        </div>
      </nav>

      <section className="hero shell">
        <div className="eyebrow">VIDEO PANJANG → SHORT CONTENT</div>
        <h1>Potong video jadi konten pendek <em>tanpa ribet.</em></h1>
        <p className="hero-copy">
          Tempel URL video. TokoClip memilih momen menarik, mengubahnya ke format vertikal,
          menambahkan subtitle, lalu menyiapkan hasil untuk diunduh.
        </p>

        <form className="clip-card" onSubmit={submit}>
          <label className="field-label" htmlFor="video-url">URL video</label>
          <div className="input-row">
            <input
              id="video-url"
              value={url}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              inputMode="url"
              autoComplete="off"
            />
            <button disabled={submitting} type="submit">
              {submitting ? "Memulai..." : "Buat Clip"}
            </button>
          </div>
          <label className="rights">
            <input
              type="checkbox"
              checked={ownsRights}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setOwnsRights(e.target.checked)}
            />
            <span>Saya memiliki atau mempunyai izin untuk memproses video ini.</span>
          </label>
        </form>

        <div className="chips">
          <span>✦ Auto highlight</span>
          <span>9:16 vertical</span>
          <span>Auto subtitle</span>
          <span>Face tracking</span>
        </div>
      </section>

      {(jobId || message) && (
        <section className="workspace shell">
          <div className="status-card">
            <div>
              <p className="section-kicker">STATUS</p>
              <h2>{progressLabel}</h2>
              {jobId && <p className="muted mono">Job: {jobId}</p>}
              {message && <p className="status-message">{message}</p>}
            </div>
            <div className={`status-dot ${status}`} aria-label={progressLabel} />
          </div>

          {status === "processing" && (
            <div className="progress"><div /></div>
          )}

          {status === "failed" && (
            <div className="notice error">
              Proses gagal. Coba URL lain atau periksa kuota pemrosesan akun.
            </div>
          )}

          {clips.length > 0 && (
            <div className="results">
              <div className="results-head">
                <div>
                  <p className="section-kicker">HASIL</p>
                  <h2>{clips.length} clip siap digunakan</h2>
                </div>
              </div>

              <div className="clip-grid">
                {clips.map((clip, index) => {
                  const videoUrl = normalizeClipUrl(clip.video_url || clip.download_url);
                  const duration =
                    typeof clip.start === "number" && typeof clip.end === "number"
                      ? Math.max(0, clip.end - clip.start).toFixed(0)
                      : null;

                  return (
                    <article className="result-card" key={`${videoUrl}-${index}`}>
                      <div className="video-wrap">
                        {videoUrl ? (
                          <video src={videoUrl} controls playsInline preload="metadata" />
                        ) : (
                          <div className="video-placeholder">Preview tidak tersedia</div>
                        )}
                      </div>
                      <div className="result-body">
                        <div className="clip-number">CLIP {String(index + 1).padStart(2, "0")}</div>
                        <h3>{clip.title || clip.video_title_for_youtube_short || `Clip ${index + 1}`}</h3>
                        {duration && <p>{duration} detik</p>}
                        {videoUrl && (
                          <a href={videoUrl} target="_blank" rel="noreferrer">Buka / Download ↗</a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="shell footer">
        <span>TokoClip</span>
        <span>Video clipping dibuat sederhana.</span>
      </footer>
    </main>
  );
}
