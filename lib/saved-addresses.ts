// Moradas guardadas no browser para a cliente não ter de preencher o
// formulário de entrega outra vez numa próxima compra. Não há contas de
// cliente no site (ver decisões no README), por isso isto vive só no
// localStorage deste aparelho — tal como o carrinho (lib/cart-context.tsx).

export type SavedAddress = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  province: string;
  municipality: string;
  bairro: string;
  addressLine: string;
  addressNotes: string;
  savedAt: string;
};

const STORAGE_KEY = "dd-beauty-addresses";
const MAX_SAVED = 5;

function readAll(): SavedAddress[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(addresses: SavedAddress[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {
    // sem armazenamento disponível: a morada simplesmente não fica guardada
  }
}

export function listSavedAddresses(): SavedAddress[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

type AddressInput = Omit<SavedAddress, "id" | "savedAt">;

function sameAddress(a: AddressInput, b: SavedAddress) {
  return (
    a.addressLine.trim().toLowerCase() === b.addressLine.trim().toLowerCase() &&
    a.municipality.trim().toLowerCase() === b.municipality.trim().toLowerCase() &&
    a.province === b.province
  );
}

// Grava a morada (atualiza se já existir uma igual, para não duplicar
// "a mesma casa" com nome ligeiramente diferente) e mantém só as mais recentes.
export function saveAddress(input: AddressInput): void {
  const existing = readAll();
  const withoutDuplicate = existing.filter((a) => !sameAddress(input, a));
  const next: SavedAddress = {
    ...input,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  writeAll([next, ...withoutDuplicate].slice(0, MAX_SAVED));
}

export function removeSavedAddress(id: string): void {
  writeAll(readAll().filter((a) => a.id !== id));
}
