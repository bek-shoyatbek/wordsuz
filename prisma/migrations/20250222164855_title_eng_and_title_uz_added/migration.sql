/*
  Warnings:

  - You are about to drop the column `title` on the `words` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title_eng]` on the table `words` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title_eng` to the `words` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `words` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "words_title_key";

-- AlterTable
ALTER TABLE "words" DROP COLUMN "title",
ADD COLUMN     "title_eng" TEXT NOT NULL,
ADD COLUMN     "title_uz" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "words_title_eng_key" ON "words"("title_eng");
