"use client";

import { useState } from "react";
import { ANGOLA_PROVINCES, OTHER_OPTION, bairrosFor, municipalitiesFor } from "@/lib/angola";

export type LocationValue = {
  province: string;
  municipality: string;
  bairro: string;
};

/**
 * Província → Município → Bairro em cascata. Cada nível usa um select com
 * as opções conhecidas; quando não há lista fiável (a maioria dos bairros
 * fora de Luanda), passa direto a um campo de texto. "Outro" aparece sempre
 * que a lista existe, para quem não encontrar a sua localidade exata.
 */
export function LocationFields({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const { province, municipality, bairro } = value;

  const municipalities = province ? municipalitiesFor(province) : [];
  const bairros = province && municipality && municipality !== OTHER_OPTION ? bairrosFor(province, municipality) : [];

  // "Outro" foi escolhido explicitamente no select (não confundir com vazio).
  const [municipalityIsOther, setMunicipalityIsOther] = useState(false);
  const [bairroIsOther, setBairroIsOther] = useState(false);

  function handleProvinceChange(nextProvince: string) {
    setMunicipalityIsOther(false);
    setBairroIsOther(false);
    onChange({ province: nextProvince, municipality: "", bairro: "" });
  }

  function handleMunicipalitySelect(selected: string) {
    setBairroIsOther(false);
    if (selected === OTHER_OPTION) {
      setMunicipalityIsOther(true);
      onChange({ ...value, municipality: "", bairro: "" });
    } else {
      setMunicipalityIsOther(false);
      onChange({ ...value, municipality: selected, bairro: "" });
    }
  }

  function handleBairroSelect(selected: string) {
    if (selected === OTHER_OPTION) {
      setBairroIsOther(true);
      onChange({ ...value, bairro: "" });
    } else {
      setBairroIsOther(false);
      onChange({ ...value, bairro: selected });
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Província">
        <select
          required
          value={province}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="input"
        >
          <option value="">Escolhe a província</option>
          {ANGOLA_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Município">
        {!province ? (
          <input disabled className="input" placeholder="Escolhe primeiro a província" />
        ) : municipalityIsOther ? (
          <input
            required
            autoFocus
            value={municipality}
            onChange={(e) => onChange({ ...value, municipality: e.target.value })}
            className="input"
            placeholder="Escreve o teu município"
          />
        ) : (
          <select
            required
            value={municipality}
            onChange={(e) => handleMunicipalitySelect(e.target.value)}
            className="input"
          >
            <option value="">Escolhe o município</option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
          </select>
        )}
      </Field>

      <div className="sm:col-span-2">
        <Field label="Bairro">
          {!municipality && !municipalityIsOther ? (
            <input disabled className="input" placeholder="Escolhe primeiro o município" />
          ) : bairroIsOther || bairros.length === 0 ? (
            <input
              required
              autoFocus={bairroIsOther}
              value={bairro}
              onChange={(e) => onChange({ ...value, bairro: e.target.value })}
              className="input"
              placeholder="Escreve o teu bairro"
            />
          ) : (
            <select
              required
              value={bairro}
              onChange={(e) => handleBairroSelect(e.target.value)}
              className="input"
            >
              <option value="">Escolhe o bairro</option>
              {bairros.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
            </select>
          )}
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}
