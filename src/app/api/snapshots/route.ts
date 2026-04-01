import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const snapshots = await prisma.monthlySnapshot.findMany({
    include: { pesoAccounts: true, usdAccounts: true, debts: true },
    orderBy: { month: "desc" },
  });
  return NextResponse.json(snapshots);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, inflation, mepRate, salary, otherIncome, pesoAccounts, usdAccounts, debts } = body;

  const snapshot = await prisma.monthlySnapshot.create({
    data: {
      month,
      inflation: Number(inflation),
      mepRate: Number(mepRate),
      salary: Number(salary),
      otherIncome: Number(otherIncome ?? 0),
      pesoAccounts: {
        create: (pesoAccounts ?? []).map((a: { name: string; amount: number }) => ({
          name: a.name,
          amount: Number(a.amount),
        })),
      },
      usdAccounts: {
        create: (usdAccounts ?? []).map((a: { name: string; amount: number }) => ({
          name: a.name,
          amount: Number(a.amount),
        })),
      },
      debts: {
        create: (debts ?? []).map((d: { name: string; currency: string; amount: number }) => ({
          name: d.name,
          currency: d.currency,
          amount: Number(d.amount),
        })),
      },
    },
    include: { pesoAccounts: true, usdAccounts: true, debts: true },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
