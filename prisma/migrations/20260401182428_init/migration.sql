-- CreateTable
CREATE TABLE "MonthlySnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "inflation" REAL NOT NULL,
    "mepRate" REAL NOT NULL,
    "salary" REAL NOT NULL,
    "otherIncome" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PesoAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "snapshotId" TEXT NOT NULL,
    CONSTRAINT "PesoAccount_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "MonthlySnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsdAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "snapshotId" TEXT NOT NULL,
    CONSTRAINT "UsdAccount_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "MonthlySnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "snapshotId" TEXT NOT NULL,
    CONSTRAINT "Debt_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "MonthlySnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySnapshot_month_key" ON "MonthlySnapshot"("month");
