"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  order: number;
  productCount: number;
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewCategoryForm nextOrder={categories.length} />

      <div className="overflow-x-auto rounded-xl border border-taupe/25 bg-white">
        <table className="w-full min-w-[560px] text-left font-body text-sm">
          <thead className="bg-taupe/10 text-ink/60">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Endereço</th>
              <th className="px-4 py-3">Ordem</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRowItem key={category.id} category={category} />
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="px-4 py-8 text-center font-body text-sm text-ink/50">
            Ainda não há categorias. Cria a primeira acima.
          </p>
        )}
      </div>
    </div>
  );
}

function NewCategoryForm({ nextOrder }: { nextOrder: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState(String(nextOrder));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, order }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível criar a categoria.");
      setSaving(false);
      return;
    }

    setName("");
    setSlug("");
    setOrder(String(nextOrder + 1));
    setSaving(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-taupe/25 bg-white p-6"
    >
      <h2 className="font-display text-xl text-ink">Nova categoria</h2>
      <div className="grid gap-4 sm:grid-cols-[1.5fr_1.5fr_0.8fr_auto]">
        <label className="flex flex-col gap-2">
          <span className="font-body text-sm text-ink/70">Nome</span>
          <input
            required
            value={name}
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              setSlug((prev) => (prev === "" || prev === slugify(name) ? slugify(value) : prev));
            }}
            className="input"
            placeholder="ex: Cuidado facial"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-body text-sm text-ink/70">Endereço</span>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="input"
            placeholder="ex: cuidado-facial"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-body text-sm text-ink/70">Ordem</span>
          <input
            required
            type="number"
            min="0"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="input"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="flex h-[3.25rem] items-center justify-center gap-2 rounded-full bg-ink px-6 font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            Criar
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl border border-ink/30 bg-taupe/15 px-4 py-3 font-body text-sm text-ink">
          {error}
        </p>
      )}
    </form>
  );
}

function CategoryRowItem({ category }: { category: CategoryRow }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [order, setOrder] = useState(String(category.order));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name !== category.name || slug !== category.slug || order !== String(category.order);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, order }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível guardar a categoria.");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    const message =
      category.productCount > 0
        ? `Esta categoria tem ${category.productCount} produto(s), que ficam sem categoria. Continuar?`
        : "Tens a certeza que queres eliminar esta categoria?";
    if (!confirm(message)) return;

    setSaving(true);
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível eliminar a categoria.");
      setSaving(false);
      return;
    }
    router.refresh();
  }

  return (
    <tr className="border-t border-taupe/15 align-top">
      <td className="px-4 py-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input h-10" />
      </td>
      <td className="px-4 py-3">
        <input
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="input h-10"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="input h-10 w-20"
        />
      </td>
      <td className="px-4 py-3 text-ink/60">{category.productCount}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-full border border-ink px-4 py-2 font-body text-xs tracking-wide-label uppercase text-ink transition hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : "Guardar"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            aria-label={`Eliminar categoria ${category.name}`}
            className="flex h-9 w-9 items-center justify-center text-ink/60 transition hover:text-ink disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {error && <p className="mt-2 font-body text-xs text-ink/70">{error}</p>}
      </td>
    </tr>
  );
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
