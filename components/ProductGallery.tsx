"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Leaf, X, ZoomIn } from "lucide-react";

type GalleryImage = { id: string; url: string; alt: string };

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = images[active];

  if (!current) {
    return (
      <div className="flex aspect-3/4 items-center justify-center bg-taupe/10 text-taupe">
        <Leaf className="h-10 w-10" aria-hidden="true" />
      </div>
    );
  }

  function openZoom() {
    setZoomed(false);
    dialogRef.current?.showModal();
  }

  function toggleZoom(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setZoomed((z) => !z);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={openZoom}
        className="group relative aspect-3/4 cursor-zoom-in overflow-hidden bg-taupe/10"
        aria-label="Ver imagem em grande"
      >
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <span className="absolute bottom-4 right-4 flex items-center gap-1.5 border border-cream/70 bg-ink/60 px-3 py-2 font-body text-[11px] tracking-[0.15em] text-cream uppercase backdrop-blur-sm">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          Ampliar
        </span>
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagem ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden bg-taupe/10 transition ${
                index === active ? "ring-1 ring-inset ring-ink" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="25vw" loading="lazy" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setZoomed(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 backdrop:bg-ink/80"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <button
            type="button"
            onClick={toggleZoom}
            className={`relative h-full w-full overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            aria-label={zoomed ? "Reduzir imagem" : "Ampliar mais"}
          >
            <Image
              src={current.url}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain transition-transform duration-300"
              style={{ transform: zoomed ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
            />
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-4 top-4 flex h-12 items-center gap-2 border border-cream/60 px-4 font-body text-[11px] tracking-[0.15em] text-cream uppercase"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            Fechar
          </button>
          <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center font-body text-sm text-cream/80">
            Toca na imagem para {zoomed ? "reduzir" : "ampliar"}
          </p>
        </div>
      </dialog>
    </div>
  );
}
