import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, RotateCw, RotateCcw } from "lucide-react";

type Props = {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

const ASPECTS = [
  { label: "Libre", value: undefined as number | undefined },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

export function ImageCropper({ src, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(3 / 4);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, p: Area) => setPixels(p), []);

  async function handleConfirm() {
    if (!pixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(src, pixels, rotation, { brightness, contrast, saturate });
      onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950">
        <h3 className="text-sm font-medium text-white">Editar imagen</h3>
        <button onClick={onCancel} className="text-zinc-400 hover:text-white"><X className="size-5" /></button>
      </div>

      <div className="relative flex-1 bg-black">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          restrictPosition={false}
          style={{ mediaStyle: { filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)` } }}
        />
      </div>

      <div className="bg-zinc-950 border-t border-zinc-800 px-5 py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-2">Recorte</span>
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              onClick={() => setAspect(a.value)}
              className={`px-3 py-1 text-xs rounded border ${aspect === a.value ? "border-white text-white" : "border-zinc-700 text-zinc-400"}`}
            >{a.label}</button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setRotation((r) => r - 90)} className="p-2 text-zinc-300 hover:text-white" title="Rotar izquierda"><RotateCcw className="size-4" /></button>
            <button onClick={() => setRotation((r) => r + 90)} className="p-2 text-zinc-300 hover:text-white" title="Rotar derecha"><RotateCw className="size-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-zinc-300">
          <Slider label="Zoom" value={zoom} min={1} max={4} step={0.05} onChange={setZoom} format={(v) => `${v.toFixed(2)}x`} />
          <Slider label="Brillo" value={brightness} min={50} max={150} step={1} onChange={setBrightness} format={(v) => `${v}%`} />
          <Slider label="Contraste" value={contrast} min={50} max={150} step={1} onChange={setContrast} format={(v) => `${v}%`} />
          <Slider label="Saturación" value={saturate} min={0} max={200} step={1} onChange={setSaturate} format={(v) => `${v}%`} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
          <button onClick={handleConfirm} disabled={busy || !pixels} className="px-5 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">
            {busy ? "Procesando…" : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
        <span className="text-[10px] text-zinc-400">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-white" />
    </label>
  );
}

// ----- canvas helpers -----
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

function getRadianAngle(deg: number) { return (deg * Math.PI) / 180; }

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedBlob(
  src: string,
  pixelCrop: Area,
  rotation: number,
  filters: { brightness: number; contrast: number; saturate: number },
): Promise<Blob> {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d ctx");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxW, height: bBoxH } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxW;
  canvas.height = bBoxH;
  ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;
  ctx.translate(bBoxW / 2, bBoxH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.filter = "none";
  ctx.putImageData(data, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.9);
  });
}
