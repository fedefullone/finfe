import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  let imported = 0;
  for (const s of data) {
    try {
      const exists = await prisma.monthlySnapshot.findUnique({
        where: { month: s.month },
      });

      if (exists) {
        await prisma.pesoAccount.deleteMany({ where: { snapshotId: exists.id } });
        await prisma.usdAccount.deleteMany({ where: { snapshotId: exists.id } });
        await prisma.debt.deleteMany({ where: { snapshotId: exists.id } });
        await prisma.monthlySnapshot.update({
          where: { id: exists.id },
          data: {
            inflation: s.inflation,
            mepRate: s.mepRate,
            salary: s.salary,
            otherIncome: s.otherIncome,
            pesoAccounts: { create: s.pesoAccounts.map((a: { name: string; amount: number }) => ({ name: a.name, amount: a.amount })) },
            usdAccounts: { create: s.usdAccounts.map((a: { name: string; amount: number }) => ({ name: a.name, amount: a.amount })) },
            debts: { create: s.debts.map((d: { name: string; currency: string; amount: number }) => ({ name: d.name, currency: d.currency, amount: d.amount })) },
          },
        });
      } else {
        await prisma.monthlySnapshot.create({
          data: {
            month: s.month,
            inflation: s.inflation,
            mepRate: s.mepRate,
            salary: s.salary,
            otherIncome: s.otherIncome,
            pesoAccounts: { create: s.pesoAccounts.map((a: { name: string; amount: number }) => ({ name: a.name, amount: a.amount })) },
            usdAccounts: { create: s.usdAccounts.map((a: { name: string; amount: number }) => ({ name: a.name, amount: a.amount })) },
            debts: { create: s.debts.map((d: { name: string; currency: string; amount: number }) => ({ name: d.name, currency: d.currency, amount: d.amount })) },
          },
        });
      }
      imported++;
    } catch (e) {
      console.error(`Error importing ${s.month}:`, e);
    }
  }

  return NextResponse.json({ imported });
}
