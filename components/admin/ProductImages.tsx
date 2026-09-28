"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

// Fotos do produto: carregar do telemóvel/computador (Uploadthing) ou colar um link.
// A primeira foto é a principal (aparece nas coleções e no topo da página).
export function ProductImages({
  urls,
  onChange,
  onUploadingChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [progress, setProgress] = useState(0);
  // O upload termina depois de vários renders: lemos sempre a lista mais recente.
  const urlsRef = useRef(urls);
  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onUploadProgress: setProgress,
    onClientUploadComplete: (files) => {
      onChange([...urlsRef.current, ...files.map((f) => f.ufsUrl)]);
      onUploadingChange(false);
    },
    onUploadError: (e) => {
      setError(
        e.message.includes("FileSizeMismatch") || e.message.toLowerCase().includes("size")
          ? "Cada foto pode ter no máximo 4 MB."
          : "Não foi possível carregar a foto. Tenta novamente.",
      );
      onUploadingChange(false);
    },
  });

  function move(index: number, delta: number) {
    const next = [...urls];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="font-body text-sm text-ink/70">Fotos do produto (a primeira é a principal)</span>

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="flex flex-col gap-1.5">
              <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-taupe/25 bg-taupe/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização no painel */}
                <img src={url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 font-body text-[11px] text-white">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onChange(urls.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-cream/90 text-ink"
                  aria-label={`Remover foto ${index + 1}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-taupe/30 disabled:opacity-30"
                  aria-label="Mover para a esquerda"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === urls.length - 1}
                  onClick={() => move(index, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-taupe/30 disabled:opacity-30"
                  aria-label="Mover para a direita"
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setError(null);
          setProgress(0);
          onUploadingChange(true);
          await startUpload(files);
        }}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="flex h-12 items-center justify-center gap-2 rounded-full border border-dashed border-gold bg-gold/5 font-body text-sm text-ink transition hover:bg-gold/10 disabled:opacity-60"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />A carregar... {progress}%
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4 text-gold" aria-hidden="true" />
            Carregar fotos
          </>
        )}
      </button>

      <details className="font-body text-sm text-ink/70">
        <summary className="cursor-pointer select-none">Ou adicionar por link</summary>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            placeholder="https://..."
            className="input flex-1"
          />
          <button
            type="button"
            onClick={() => {
              const url = linkDraft.trim();
              if (!url) return;
              onChange([...urls, url]);
              setLinkDraft("");
            }}
            className="flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-cream"
          >
            <Link2 className="h-4 w-4" aria-hidden="true" />
            Adicionar
          </button>
        </div>
      </details>

      {error && (
        <p role="alert" className="font-body text-sm text-ink">
          {error}
        </p>
      )}
    </div>
  );
}
