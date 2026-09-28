"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();

  useEffect(() => {
    // Esperar pelo carrinho guardado; senão seria reposto logo a seguir a limpar.
    if (hydrated) clear();
  }, [hydrated, clear]);

  return null;
}
