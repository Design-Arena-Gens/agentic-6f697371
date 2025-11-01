"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

type Palette = {
  sky: [string, string, string];
  catPrimary: string;
  catSecondary: string;
  accent: string;
  sparkle: string;
};

const palettes: Palette[] = [
  {
    sky: ["#fef9c3", "#fde68a", "#fecdd3"],
    catPrimary: "#fb7185",
    catSecondary: "#fef3c7",
    accent: "#fb923c",
    sparkle: "rgba(255,255,255,0.88)"
  },
  {
    sky: ["#ede9fe", "#c4b5fd", "#fbcfe8"],
    catPrimary: "#a855f7",
    catSecondary: "#f5d0fe",
    accent: "#f97316",
    sparkle: "rgba(255,255,255,0.9)"
  },
  {
    sky: ["#cffafe", "#bae6fd", "#fecaca"],
    catPrimary: "#0ea5e9",
    catSecondary: "#bae6fd",
    accent: "#22d3ee",
    sparkle: "rgba(255,255,255,0.92)"
  },
  {
    sky: ["#f1f5f9", "#cbd5f5", "#fde68a"],
    catPrimary: "#64748b",
    catSecondary: "#cbd5f5",
    accent: "#fbbf24",
    sparkle: "rgba(255,255,255,0.85)"
  }
];

type FrameConfig = {
  ctx: CanvasRenderingContext2D;
  elapsed: number;
  duration: number;
  catCount: number;
  chaos: number;
  palette: Palette;
  sparkleSeed: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function drawBackdrop(ctx: CanvasRenderingContext2D, palette: Palette) {
  const gradient = ctx.createLinearGradient(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  gradient.addColorStop(0, palette.sky[0]);
  gradient.addColorStop(0.55, palette.sky[1]);
  gradient.addColorStop(1, palette.sky[2]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 120; i += 1) {
    const starX = (i * 97) % VIDEO_WIDTH;
    const starY = (i * 173) % VIDEO_HEIGHT;
    const radius = 0.6 + ((starX * starY) % 10) * 0.12;
    ctx.beginPath();
    ctx.fillStyle = palette.sparkle;
    ctx.arc(starX, starY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.28;
  const hillGradient = ctx.createLinearGradient(0, VIDEO_HEIGHT * 0.55, 0, VIDEO_HEIGHT);
  hillGradient.addColorStop(0, "rgba(255,255,255,0)");
  hillGradient.addColorStop(1, "rgba(255,255,255,0.9)");
  ctx.fillStyle = hillGradient;
  ctx.beginPath();
  ctx.moveTo(0, VIDEO_HEIGHT);
  for (let x = 0; x <= VIDEO_WIDTH; x += 8) {
    const rela = x / VIDEO_WIDTH;
    const wave = Math.sin(rela * Math.PI * 2) * 22;
    ctx.lineTo(x, VIDEO_HEIGHT * 0.68 + wave);
  }
  ctx.lineTo(VIDEO_WIDTH, VIDEO_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  progress: number,
  palette: Palette,
  chaos: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bounce = Math.sin(progress * Math.PI * (2 + chaos * 0.08)) * 24;
  const tailWag = Math.cos(progress * Math.PI * (4 + chaos * 0.12)) * 0.6;
  const blink = progress % 1 > 0.85 ? 0.1 : 1;

  // Shadow
  ctx.save();
  ctx.translate(0, 130);
  ctx.scale(1, 0.28);
  ctx.beginPath();
  ctx.fillStyle = "rgba(30, 41, 59, 0.2)";
  ctx.ellipse(0, 0, 110, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.translate(0, bounce);

  // Tail
  ctx.save();
  ctx.translate(90, 20);
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.fillStyle = palette.catPrimary;
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(65, -35, 110, -10);
  ctx.quadraticCurveTo(140, 10, 118, 35);
  ctx.quadraticCurveTo(95, 55, 40, 40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body
  ctx.beginPath();
  ctx.fillStyle = palette.catPrimary;
  ctx.ellipse(0, 40, 110, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.beginPath();
  ctx.fillStyle = palette.catSecondary;
  ctx.ellipse(-10, 50, 65, 45, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.fillStyle = palette.catPrimary;
  ctx.arc(-120, -10, 60, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(-165, -55);
  ctx.lineTo(-140, -115);
  ctx.lineTo(-115, -55);
  ctx.closePath();
  ctx.fillStyle = palette.catPrimary;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-80, -55);
  ctx.lineTo(-55, -115);
  ctx.lineTo(-35, -55);
  ctx.closePath();
  ctx.fillStyle = palette.catPrimary;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-147, -60);
  ctx.lineTo(-139, -95);
  ctx.lineTo(-115, -60);
  ctx.closePath();
  ctx.fillStyle = palette.catSecondary;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-70, -60);
  ctx.lineTo(-58, -95);
  ctx.lineTo(-42, -60);
  ctx.closePath();
  ctx.fillStyle = palette.catSecondary;
  ctx.fill();

  // Face
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(-140, -10, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.scale(1, blink);
  ctx.beginPath();
  ctx.arc(-90, -10 / (blink || 1), 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.fillStyle = palette.accent;
  ctx.moveTo(-118, 10);
  ctx.quadraticCurveTo(-110, 18, -102, 10);
  ctx.quadraticCurveTo(-110, 22, -118, 10);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "rgba(17, 24, 39, 0.8)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-160, 2);
  ctx.lineTo(-195, -6);
  ctx.moveTo(-160, 18);
  ctx.lineTo(-198, 18);
  ctx.moveTo(-75, 2);
  ctx.lineTo(-38, -6);
  ctx.moveTo(-75, 18);
  ctx.lineTo(-32, 18);
  ctx.stroke();

  // Paws
  for (let i = -1; i <= 1; i += 2) {
    ctx.save();
    ctx.translate(i * 45, 95);
    ctx.beginPath();
    ctx.fillStyle = palette.catSecondary;
    ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = palette.accent;
    ctx.ellipse(-10, -3, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(0, -5, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(10, -3, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Sparkles near face
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = palette.sparkle;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    const offsetX = -50 + i * 25;
    const offsetY = -45 - (i % 2) * 18;
    ctx.arc(offsetX, offsetY, 6 + i * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

function drawForegroundDetails(ctx: CanvasRenderingContext2D, palette: Palette, elapsed: number, chaos: number) {
  ctx.save();
  const beat = Math.sin((elapsed / 1000) * (1.4 + chaos * 0.1));
  ctx.globalAlpha = 0.3 + beat * 0.05;
  ctx.fillStyle = palette.accent;
  for (let i = 0; i < 6; i += 1) {
    const size = 35 + (i % 3) * 12;
    const x = ((i * 189 + elapsed * 0.1) % (VIDEO_WIDTH + size)) - size;
    const y = VIDEO_HEIGHT * 0.8 + Math.sin(i * 734 + elapsed * 0.002) * 28;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * 0.35, y + size * 0.45);
    ctx.lineTo(x - size * 0.45, y + size * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function renderFrame(config: FrameConfig) {
  const { ctx, elapsed, duration, catCount, chaos, palette, sparkleSeed } = config;

  ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  drawBackdrop(ctx, palette);

  const baseDuration = Math.max(duration, 1000);
  const timeRatio = (elapsed % baseDuration) / baseDuration;

  for (let index = 0; index < catCount; index += 1) {
    const direction = index % 2 === 0 ? 1 : -1;
    const travel = timeRatio * (VIDEO_WIDTH + 260);
    const offset = index * (260 / clamp(catCount, 1, 6));
    const x = direction === 1 ? travel - 130 : VIDEO_WIDTH - travel + 130;
    const laneBase = VIDEO_HEIGHT * (0.35 + (index / Math.max(catCount - 1, 1)) * 0.35);
    const wave = Math.sin((elapsed / 1000) * (0.8 + index * 0.15)) * (38 + chaos * 3.2);
    const y = laneBase + wave;
    const scale = 0.7 + (index / Math.max(catCount - 1, 1)) * 0.45;

    const phase =
      ((elapsed / 1000) * (0.6 + index * 0.15 + chaos * 0.02) + sparkleSeed * 0.1) % 1;

    drawCat(ctx, x, y, scale, phase, palette, chaos);
  }

  drawForegroundDetails(ctx, palette, elapsed, chaos);
}

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm"
];

function pickSupportedMimeType(): string | undefined {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return undefined;
  }
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewFrameRef = useRef<number>();
  const animationRef = useRef<number>();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [duration, setDuration] = useState(5);
  const [catCount, setCatCount] = useState(3);
  const [chaos, setChaos] = useState(5);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paletteIndex, setPaletteIndex] = useState(0);

  const palette = useMemo(() => palettes[paletteIndex % palettes.length], [paletteIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
  }, []);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const start = performance.now();
    const animate = (now: number) => {
      renderFrame({
        ctx,
        elapsed: now - start,
        duration: duration * 1000,
        catCount,
        chaos,
        palette,
        sparkleSeed: paletteIndex
      });
      previewFrameRef.current = requestAnimationFrame(animate);
    };

    previewFrameRef.current = requestAnimationFrame(animate);
  }, [duration, catCount, chaos, palette, paletteIndex]);

  useEffect(() => {
    if (isRecording) {
      if (previewFrameRef.current) {
        cancelAnimationFrame(previewFrameRef.current);
        previewFrameRef.current = undefined;
      }
      return;
    }
    renderPreview();
    return () => {
      if (previewFrameRef.current) {
        cancelAnimationFrame(previewFrameRef.current);
        previewFrameRef.current = undefined;
      }
    };
  }, [renderPreview, isRecording]);

  useEffect(
    () => () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (previewFrameRef.current) {
        cancelAnimationFrame(previewFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    },
    [videoUrl]
  );

  const handleGenerate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      setError("Canvas unavailable. Try reloading the page.");
      return;
    }

    const mimeType = pickSupportedMimeType();
    if (!mimeType) {
      setError("MediaRecorder not supported in this browser.");
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    setPaletteIndex((prev) => prev + 1);
    setIsRecording(true);
    setError(null);
    chunksRef.current = [];

    const stream = canvas.captureStream(60);
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4_500_000
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setIsRecording(false);
      chunksRef.current = [];
    };

    recorder.start(200);

    const start = performance.now();
    const captureDuration = duration * 1000;

    const animate = (now: number) => {
      const elapsed = now - start;
      renderFrame({
        ctx,
        elapsed,
        duration: captureDuration,
        catCount,
        chaos,
        palette: palettes[(paletteIndex + 1) % palettes.length],
        sparkleSeed: paletteIndex + 1
      });

      if (elapsed < captureDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        renderFrame({
          ctx,
          elapsed: captureDuration,
          duration: captureDuration,
          catCount,
          chaos,
          palette: palettes[(paletteIndex + 1) % palettes.length],
          sparkleSeed: paletteIndex + 1
        });
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }
    };

    if (previewFrameRef.current) {
      cancelAnimationFrame(previewFrameRef.current);
      previewFrameRef.current = undefined;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [catCount, chaos, duration, paletteIndex, videoUrl]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .split("Z")[0];
    link.href = videoUrl;
    link.download = `cat-video-${stamp}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [videoUrl]);

  return (
    <main className="card">
      <div>
        <span className="pill">Instant Cat Cinema</span>
        <h1>Generate A Custom Cat Video</h1>
        <p className="subtitle">
          Dial in the chaos, pick the perfect cat crew, and render a slick, downloadable
          video straight from your browser. No uploads, no waiting — just vibes and paws.
        </p>
      </div>

      <div className="controls">
        <div className="slider-group">
          <label htmlFor="duration">
            Duration: {duration.toFixed(1)}s
          </label>
          <input
            id="duration"
            type="range"
            min={3}
            max={9}
            step={0.5}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            disabled={isRecording}
          />
        </div>
        <div className="slider-group">
          <label htmlFor="catCount">
            Cat Density: {catCount} buddy{catCount === 1 ? "" : "ies"}
          </label>
          <input
            id="catCount"
            type="range"
            min={1}
            max={6}
            step={1}
            value={catCount}
            onChange={(event) => setCatCount(Number(event.target.value))}
            disabled={isRecording}
          />
        </div>
        <div className="slider-group">
          <label htmlFor="chaos">
            Chaos Level: {chaos}
          </label>
          <input
            id="chaos"
            type="range"
            min={1}
            max={10}
            step={1}
            value={chaos}
            onChange={(event) => setChaos(Number(event.target.value))}
            disabled={isRecording}
          />
        </div>
        <button
          className="button"
          onClick={handleGenerate}
          disabled={isRecording}
          type="button"
        >
          {isRecording ? "Rendering…" : "Generate Video"}
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>

      {error && <p className="subtitle" style={{ color: "#b91c1c" }}>{error}</p>}

      {videoUrl && (
        <div className="video-output">
          <video controls src={videoUrl} />
          <div className="controls">
            <button className="button secondary" type="button" onClick={handleDownload}>
              Download
            </button>
            <button className="button" type="button" onClick={handleGenerate}>
              Regenerate
            </button>
          </div>
        </div>
      )}

      <div className="tips">
        <strong>Tips</strong>
        <span>Use desktop Chrome or Firefox for the crispest exports.</span>
        <span>
          Want the perfect loop? Keep duration small and chaos low for smooth repeats.
        </span>
        <span>
          Blend multiple renders together for instant cat music videos, no editing suite
          needed.
        </span>
      </div>
    </main>
  );
}
