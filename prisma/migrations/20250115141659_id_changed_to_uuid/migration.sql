-- CreateTable
CREATE TABLE "Prefix" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "definition" TEXT NOT NULL,

    CONSTRAINT "Prefix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "transcription" TEXT,
    "usageFrequency" INTEGER,
    "anagrams" TEXT[],

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Definition" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "typeEn" TEXT NOT NULL,
    "typeUz" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "plural" TEXT,
    "synonyms" TEXT[],

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherMeaning" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "OtherMeaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT,
    "otherMeaningId" TEXT,
    "phrase" TEXT NOT NULL,
    "translation" TEXT NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExampleSentence" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "translation" TEXT NOT NULL,

    CONSTRAINT "ExampleSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbForm" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "tense" TEXT NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "VerbForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrregularVerb" (
    "id" TEXT NOT NULL,
    "baseForm" TEXT NOT NULL,
    "pastSimple" TEXT NOT NULL,
    "pastParticiple" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "IrregularVerb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_title_key" ON "Word"("title");

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherMeaning" ADD CONSTRAINT "OtherMeaning_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_otherMeaningId_fkey" FOREIGN KEY ("otherMeaningId") REFERENCES "OtherMeaning"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleSentence" ADD CONSTRAINT "ExampleSentence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbForm" ADD CONSTRAINT "VerbForm_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
