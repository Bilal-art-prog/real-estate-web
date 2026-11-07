/** Pakistani land-area units + PKR money formatting. */

export type AreaUnit = "sqft" | "sqyd" | "marla" | "kanal";

/** Square feet per unit (Pakistan standard: 1 marla = 272.25 sq ft). */
export const SQFT_PER: Record<AreaUnit, number> = {
  sqft: 1,
  sqyd: 9,
  marla: 272.25,
  kanal: 5445,
};

export const unitLabels: Record<AreaUnit, string> = {
  sqft: "sq ft",
  sqyd: "sq yd",
  marla: "marla",
  kanal: "kanal",
};

export function convertArea(value: number, from: AreaUnit, to: AreaUnit) {
  return (value * SQFT_PER[from]) / SQFT_PER[to];
}

export function formatArea(value: number, unit: AreaUnit = "sqft") {
  const v = convertArea(value, "sqft", unit);
  const rounded = v >= 100 ? Math.round(v) : Math.round(v * 100) / 100;
  return `${rounded.toLocaleString("en-PK")} ${unitLabels[unit]}`;
}

/** All four units for one sq ft value — used by the detail-page converter. */
export function areaBreakdown(sqft: number) {
  return (Object.keys(SQFT_PER) as AreaUnit[]).map((u) => ({
    unit: u,
    label: unitLabels[u],
    value: convertArea(sqft, "sqft", u),
  }));
}

export const sqftToMarla = (sqft: number) => Math.round(convertArea(sqft, "sqft", "marla") * 10) / 10;

/** PKR 475000000 → "PKR 4.75 Crore" · PKR 8500000 → "PKR 85 Lakh" */
export function formatPKR(value: number, opts: { monthly?: boolean; symbol?: boolean } = {}) {
  const { monthly = false, symbol = true } = opts;
  const prefix = symbol ? "PKR " : "";
  const suffix = monthly ? "/month" : "";
  if (value >= 10_000_000) {
    const cr = value / 10_000_000;
    return `${prefix}${trim(cr)} Crore${suffix ? " " + suffix : ""}`;
  }
  if (value >= 100_000) {
    const lac = value / 100_000;
    return `${prefix}${trim(lac)} Lakh${suffix ? " " + suffix : ""}`;
  }
  return `${prefix}${value.toLocaleString("en-PK")}${suffix ? " " + suffix : ""}`;
}

const trim = (n: number) => (Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2).replace(/0$/, ""));

export const formatNumber = (n: number) => Math.round(n).toLocaleString("en-PK");
