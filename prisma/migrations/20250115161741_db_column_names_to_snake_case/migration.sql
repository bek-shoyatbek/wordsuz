/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Definition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExampleSentence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IrregularVerb` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meaning` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerbForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Word` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Definition" DROP CONSTRAINT "Definition_wordId_fkey";

-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_definitionId_fkey";

-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_otherMeaningId_fkey";

-- DropForeignKey
ALTER TABLE "ExampleSentence" DROP CONSTRAINT "ExampleSentence_wordId_fkey";

-- DropForeignKey
ALTER TABLE "Meaning" DROP CONSTRAINT "Meaning_definitionId_fkey";

-- DropForeignKey
ALTER TABLE "VerbForm" DROP CONSTRAINT "VerbForm_wordId_fkey";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Definition";

-- DropTable
DROP TABLE "Example";

-- DropTable
DROP TABLE "ExampleSentence";

-- DropTable
DROP TABLE "IrregularVerb";

-- DropTable
DROP TABLE "Meaning";

-- DropTable
DROP TABLE "VerbForm";

-- DropTable
DROP TABLE "Word";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "transcription" TEXT,
    "usage_frequency" INTEGER,
    "synonyms" TEXT[],
    "anagrams" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "definitions" (
    "id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "type_en" TEXT NOT NULL,
    "type_uz" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "plural" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meanings" (
    "id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meanings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examples" (
    "id" TEXT NOT NULL,
    "other_meaning_id" TEXT,
    "phrase" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "word_id" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verbforms" (
    "id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "tense" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verbforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irregular_verbs" (
    "id" TEXT NOT NULL,
    "base_form" TEXT NOT NULL,
    "past_simple" TEXT NOT NULL,
    "past_participle" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irregular_verbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "words_title_key" ON "words"("title");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meanings" ADD CONSTRAINT "meanings_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examples" ADD CONSTRAINT "examples_other_meaning_id_fkey" FOREIGN KEY ("other_meaning_id") REFERENCES "meanings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examples" ADD CONSTRAINT "examples_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verbforms" ADD CONSTRAINT "verbforms_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
