import { MonthlySnapshot, SnapshotMetrics, ReturnMetrics } from "./types";

export function calcMetrics(s: MonthlySnapshot): SnapshotMetrics {
  const arsAssets = s.pesoAccounts.reduce((sum, a) => sum + a.amount, 0);
  const usdAssets = s.usdAccounts.reduce((sum, a) => sum + a.amount, 0);
  const arsDebts = s.debts
    .filter((d) => d.currency === "ARS")
    .reduce((sum, d) => sum + d.amount, 0);
  const usdDebts = s.debts
    .filter((d) => d.currency === "USD")
    .reduce((sum, d) => sum + d.amount, 0);

  const arsNetWorth = arsAssets - arsDebts;
  const usdNetWorth = usdAssets - usdDebts;
  const consolidatedUSD = arsNetWorth / s.mepRate + usdNetWorth;
  const totalIncome = s.salary + s.otherIncome;

  return {
    arsAssets,
    usdAssets,
    arsDebts,
    usdDebts,
    arsNetWorth,
    usdNetWorth,
    consolidatedUSD,
    totalIncome,
  };
}

export function calcReturnMetrics(
  current: MonthlySnapshot,
  prev: MonthlySnapshot
): ReturnMetrics {
  const prevMetrics = calcMetrics(prev);
  const currMetrics = calcMetrics(current);

  const capitalInicial = prevMetrics.consolidatedUSD;
  // Remove new income from current consolidated (converted to USD)
  const incomeInUSD = currMetrics.totalIncome / current.mepRate;
  const capitalFinal = currMetrics.consolidatedUSD - incomeInUSD;

  const nominalReturn =
    capitalInicial > 0 ? (capitalFinal - capitalInicial) / capitalInicial : 0;
  const inflationRate = current.inflation / 100;
  const realReturn = (1 + nominalReturn) / (1 + inflationRate) - 1;

  return {
    nominalReturnPct: nominalReturn * 100,
    realReturnPct: realReturn * 100,
    beatInflation: realReturn > 0,
    capitalInicial,
    capitalFinal,
  };
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${months[parseInt(m) - 1]} ${year}`;
}
