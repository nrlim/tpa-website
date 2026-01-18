/*
  Warnings:

  - You are about to drop the `PendingRegistration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PendingRegistration";

-- CreateTable
CREATE TABLE "PreUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "studentFullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "existingParentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PreUser_status_idx" ON "PreUser"("status");

-- CreateIndex
CREATE INDEX "PreUser_email_idx" ON "PreUser"("email");
