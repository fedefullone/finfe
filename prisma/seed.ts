import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.debt.deleteMany();
  await prisma.pesoAccount.deleteMany();
  await prisma.usdAccount.deleteMany();
  await prisma.monthlySnapshot.deleteMany();

  // Seed 4 months of example data (Dec 2024 - Mar 2025)
  const months = [
    {
      month: "2024-12",
      inflation: 2.7,
      mepRate: 1060,
      salary: 1200000,
      otherIncome: 50000,
      pesoAccounts: [
        { name: "Cuenta corriente Santander", amount: 380000 },
        { name: "Caja ahorro Brubank", amount: 95000 },
        { name: "Plazo fijo Naranja", amount: 1200000 },
      ],
      usdAccounts: [
        { name: "Efectivo", amount: 2500 },
        { name: "Lemon Cash", amount: 800 },
      ],
      debts: [
        { name: "Tarjeta Visa", currency: "ARS", amount: 120000 },
        { name: "Préstamo personal", currency: "ARS", amount: 350000 },
      ],
    },
    {
      month: "2025-01",
      inflation: 2.3,
      mepRate: 1085,
      salary: 1320000,
      otherIncome: 80000,
      pesoAccounts: [
        { name: "Cuenta corriente Santander", amount: 410000 },
        { name: "Caja ahorro Brubank", amount: 120000 },
        { name: "Plazo fijo Naranja", amount: 1300000 },
      ],
      usdAccounts: [
        { name: "Efectivo", amount: 2700 },
        { name: "Lemon Cash", amount: 950 },
      ],
      debts: [
        { name: "Tarjeta Visa", currency: "ARS", amount: 95000 },
        { name: "Préstamo personal", currency: "ARS", amount: 280000 },
      ],
    },
    {
      month: "2025-02",
      inflation: 2.4,
      mepRate: 1095,
      salary: 1320000,
      otherIncome: 120000,
      pesoAccounts: [
        { name: "Cuenta corriente Santander", amount: 475000 },
        { name: "Caja ahorro Brubank", amount: 180000 },
        { name: "Plazo fijo Naranja", amount: 1420000 },
      ],
      usdAccounts: [
        { name: "Efectivo", amount: 2700 },
        { name: "Lemon Cash", amount: 1100 },
      ],
      debts: [
        { name: "Tarjeta Visa", currency: "ARS", amount: 88000 },
        { name: "Préstamo personal", currency: "ARS", amount: 210000 },
      ],
    },
    {
      month: "2025-03",
      inflation: 3.7,
      mepRate: 1130,
      salary: 1450000,
      otherIncome: 90000,
      pesoAccounts: [
        { name: "Cuenta corriente Santander", amount: 520000 },
        { name: "Caja ahorro Brubank", amount: 220000 },
        { name: "Plazo fijo Naranja", amount: 1550000 },
      ],
      usdAccounts: [
        { name: "Efectivo", amount: 3000 },
        { name: "Lemon Cash", amount: 1200 },
      ],
      debts: [
        { name: "Tarjeta Visa", currency: "ARS", amount: 110000 },
        { name: "Préstamo personal", currency: "ARS", amount: 140000 },
      ],
    },
  ];

  for (const data of months) {
    await prisma.monthlySnapshot.create({
      data: {
        month: data.month,
        inflation: data.inflation,
        mepRate: data.mepRate,
        salary: data.salary,
        otherIncome: data.otherIncome,
        pesoAccounts: { create: data.pesoAccounts },
        usdAccounts: { create: data.usdAccounts },
        debts: { create: data.debts },
      },
    });
  }

  console.log("✅ Seed completado con 4 meses de datos de ejemplo.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
