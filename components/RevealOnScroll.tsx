"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fallback das animações de entrada para browsers sem animações guiadas pelo
// scroll (Firefox, Safari < 26). Nos restantes, o CSS trata de tudo sozinho.
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const native = CSS.supports("(animation-timeline: view()) and (animation-range: entry)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (native || reduced || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("reveal-fallback");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // anima só uma vez
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const observeAll = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
      document.querySelectorAll<HTMLElement>(".reveal-stagger").forEach((group) => {
        Array.from(group.children).forEach((child, index) => {
          if (!(child instanceof HTMLElement) || child.classList.contains("is-visible")) return;
          child.style.setProperty("--reveal-index", String(index % 6));
          observer.observe(child);
        });
      });
    };

    observeAll();
    // Conteúdo que aparece depois (ex: filtros das coleções) também é observado.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
