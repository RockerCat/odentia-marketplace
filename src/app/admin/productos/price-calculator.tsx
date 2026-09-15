"use client";

import { useState } from "react";

const MARGIN_PRESETS = [10, 15, 20, 25, 30, 35, 40, 45];

export default function PriceCalculator({
  defaultCostPriceCents,
  defaultMarginPercent,
  defaultPriceCents,
  costError,
  marginError,
  priceError,
}: {
  defaultCostPriceCents?: number | null;
  defaultMarginPercent?: number | null;
  defaultPriceCents: number;
  costError?: string;
  marginError?: string;
  priceError?: string;
}) {
  const initialPreset =
    defaultMarginPercent != null && MARGIN_PRESETS.includes(defaultMarginPercent)
      ? String(defaultMarginPercent)
      : defaultMarginPercent != null
        ? "otro"
        : "";
  const initialCustom =
    defaultMarginPercent != null && !MARGIN_PRESETS.includes(defaultMarginPercent)
      ? String(defaultMarginPercent)
      : "";

  const [cost, setCost] = useState(
    defaultCostPriceCents != null ? String(defaultCostPriceCents) : ""
  );
  const [marginPreset, setMarginPreset] = useState(initialPreset);
  const [marginCustom, setMarginCustom] = useState(initialCustom);
  const [price, setPrice] = useState(String(defaultPriceCents));

  const effectiveMargin = marginPreset === "otro" ? marginCustom : marginPreset;

  function recalcPrice(nextCost: string, nextMargin: string) {
    const c = parseFloat(nextCost);
    const m = parseFloat(nextMargin);
    if (Number.isFinite(c) && c >= 0 && Number.isFinite(m)) {
      setPrice(String(Math.round(c * (1 + m / 100))));
    }
  }

  function handleCostChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCost(value);
    recalcPrice(value, effectiveMargin);
  }

  function handleMarginPresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setMarginPreset(value);
    recalcPrice(cost, value === "otro" ? marginCustom : value);
  }

  function handleMarginCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setMarginCustom(value);
    recalcPrice(cost, value);
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="costPrice" className="block text-sm font-medium text-foreground/80 mb-1">
            Precio de costo (COP)
          </label>
          <input
            type="number"
            step="1"
            min="0"
            id="costPrice"
            name="costPrice"
            value={cost}
            onChange={handleCostChange}
            placeholder="Ej. 30000"
            className="w-full"
          />
          {costError && <p className="text-sm text-danger mt-1">{costError}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="marginPreset" className="block text-sm font-medium text-foreground/80 mb-1">
            Margen (%)
          </label>
          <select
            id="marginPreset"
            value={marginPreset}
            onChange={handleMarginPresetChange}
            className="w-full"
          >
            <option value="">Selecciona...</option>
            {MARGIN_PRESETS.map((pct) => (
              <option key={pct} value={pct}>
                {pct}%
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>
          {marginPreset === "otro" && (
            <input
              type="number"
              step="0.01"
              min="0"
              value={marginCustom}
              onChange={handleMarginCustomChange}
              placeholder="Porcentaje personalizado"
              className="w-full mt-2"
            />
          )}
          {marginError && <p className="text-sm text-danger mt-1">{marginError}</p>}
        </div>
      </div>

      <input type="hidden" name="marginPercent" value={effectiveMargin} />

      <div className="flex-1">
        <label htmlFor="price" className="block text-sm font-medium text-foreground/80 mb-1">
          Precio de venta (COP)
        </label>
        <input
          type="number"
          step="1"
          min="0"
          id="price"
          name="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ej. 45000"
          className="w-full"
        />
        {priceError && <p className="text-sm text-danger mt-1">{priceError}</p>}
      </div>
    </>
  );
}
