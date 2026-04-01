import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { month: string } }
) {
  const snapshot = await prisma.monthlySnapshot.findUnique({
    where: { month: params.month },
    include: { pesoAccounts: true, usdAccounts: true, debts: true },
  });
  if (!snapshot) return NextResponse.json(null);
  return NextResponse.json(snapshot);
}
