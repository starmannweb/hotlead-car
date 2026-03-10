-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ViewLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ViewLog_pkey" PRIMARY KEY ("id")
);
