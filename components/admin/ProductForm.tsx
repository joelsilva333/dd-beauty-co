"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { ProductImages } from "./ProductImages";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  shortDesc: string;
  story: string;
  ritual: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  categoryId: string;
  featured: boolean;
  curatedMonth: boolean;
  active: boolean;
  imageUrls: string;
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  shortDesc: "",
  story: "",
  ritual: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  categoryId: "",
  featured: false,
  curatedMonth: false,
  active: true,
  imageUrls: "",
};

export function ProductForm({
  initial,
  categories,
}: {
  initial?: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = { ...values, imageUrls: parseImageUrls(values.imageUrls) };

    const res = await fetch(
      values.id ? `/api/admin/products/${values.id}` : "/api/admin/products",
      {
        method: values.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível guardar o produto.");
      setSaving(false);
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  async function handleDelete() {
    if (!values.id) return;
    if (!confirm("Tens a certeza que queres eliminar este produto?")) return;
    const res = await fetch(`/api/admin/products/${values.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível eliminar o produto.");
      return;
    }
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-taupe/25 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome do produto">
          <input
            required
            value={values.name}
            onChange={(e) => {
              const name = e.target.value;
              setValues((v) => ({
                ...v,
                name,
                // Enquanto o endereço não for editado à mão, acompanha o nome.
                slug: !v.id && (v.slug === "" || v.slug === slugify(v.name)) ? slugify(name) : v.slug,
              }));
            }}
            className="input"
          />
        </Field>
        <Field label="Endereço da página (gerado a partir do nome)">
          <input
            required
            value={values.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
            className="input"
            placeholder="ex: oleo-facial-baoba"
          />
        </Field>
      </div>

      <Field label="Descrição curta">
        <input
          required
          value={values.shortDesc}
          onChange={(e) => update("shortDesc", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="A história por trás (storytelling)">
        <textarea
          required
          value={values.story}
          onChange={(e) => update("story", e.target.value)}
          className="input min-h-28"
        />
      </Field>

      <Field label="Ritual de uso (opcional)">
        <textarea
          value={values.ritual}
          onChange={(e) => update("ritual", e.target.value)}
          className="input min-h-20"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Preço (Kz)">
          <input
            required
            type="number"
            min="0"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Preço antes (opcional)">
          <input
            type="number"
            min="0"
            value={values.compareAtPrice}
            onChange={(e) => update("compareAtPrice", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Stock">
          <input
            required
            type="number"
            min="0"
            value={values.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <Field label="Categoria">
        <select
          value={values.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          className="input"
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <ProductImages
        urls={parseImageUrls(values.imageUrls)}
        onChange={(urls) => update("imageUrls", urls.join("\n"))}
        onUploadingChange={setUploading}
      />

      <div className="flex flex-wrap gap-6">
        <Checkbox
          label="Produto ativo (visível no site)"
          checked={values.active}
          onChange={(v) => update("active", v)}
        />
        <Checkbox
          label="Em destaque"
          checked={values.featured}
          onChange={(v) => update("featured", v)}
        />
        <Checkbox
          label="Curadoria do mês"
          checked={values.curatedMonth}
          onChange={(v) => update("curatedMonth", v)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-ink/30 bg-taupe/15 px-4 py-3 font-body text-sm text-ink">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-taupe/25 pt-5">
        {values.id ? (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 font-body text-sm text-ink/70 underline underline-offset-4 hover:text-ink"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar produto
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Guardar produto
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink/70">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 font-body text-sm text-ink/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-gold"
      />
      {label}
    </label>
  );
}

function parseImageUrls(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
