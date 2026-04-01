import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const snapshot = await prisma.monthlySnapshot.findUnique({
    where: { id: params.id },
    include: { pesoAccounts: true, usdAccounts: true, debts: true },
  });
  if (!snapshot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(snapshot);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { month, inflation, mepRate, salary, otherIncome, pesoAccounts, usdAccounts, debts } = body;

  // Delete existing relations
  await prisma.pesoAccount.deleteMany({ where: { snapshotId: params.id } });
  await prisma.usdAccount.deleteMany({ where: { snapshotId: params.id } });
  await prisma.debt.deleteMany({ where: { snapshotId: params.id } });

  const snapshot = await prisma.monthlySnapshot.update({
    where: { id: params.id },
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

  return NextResponse.json(snapshot);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.monthlySnapshot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
