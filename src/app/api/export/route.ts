import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const snapshots = await prisma.monthlySnapshot.findMany({
    include: { pesoAccounts: true, usdAccounts: true, debts: true },
    orderBy: { month: "asc" },
  });

  const json = JSON.stringify(snapshots, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="finfe-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
