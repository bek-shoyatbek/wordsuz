/*
  Warnings:

  - You are about to drop the `OtherMeaning` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contentId` to the `VerbForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_otherMeaningId_fkey";

-- DropForeignKey
ALTER TABLE "OtherMeaning" DROP CONSTRAINT "OtherMeaning_definitionId_fkey";

-- AlterTable
ALTER TABLE "VerbForm" ADD COLUMN     "contentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "OtherMeaning";

-- CreateTable
CREATE TABLE "Meaning" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "Meaning_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Meaning" ADD CONSTRAINT "Meaning_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_otherMeaningId_fkey" FOREIGN KEY ("otherMeaningId") REFERENCES "Meaning"("id") ON DELETE SET NULL ON UPDATE CASCADE;
