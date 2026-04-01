export interface PesoAccount {
  id: string;
  name: string;
  amount: number;
  snapshotId: string;
}

export interface UsdAccount {
  id: string;
  name: string;
  amount: number;
  snapshotId: string;
}

export interface Debt {
  id: string;
  name: string;
  currency: "ARS" | "USD";
  amount: number;
  snapshotId: string;
}

export interface MonthlySnapshot {
  id: string;
  month: string;
  inflation: number;
  mepRate: number;
  salary: number;
  otherIncome: number;
  pesoAccounts: PesoAccount[];
  usdAccounts: UsdAccount[];
  debts: Debt[];
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotMetrics {
  arsAssets: number;
  usdAssets: number;
  arsDebts: number;
  usdDebts: number;
  arsNetWorth: number;
  usdNetWorth: number;
  consolidatedUSD: number;
  totalIncome: number;
}

export interface ReturnMetrics {
  nominalReturnPct: number;
  realReturnPct: number;
  beatInflation: boolean;
  capitalInicial: number;
  capitalFinal: number;
}
