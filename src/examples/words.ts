import { IrregularVerb, WordDetails } from "src/word/types";

export const wordDetails: WordDetails = {
    title: "air",
    transcription: "æə",
    definitions: [
        {
            typeEn: "noun",
            typeUz: "ot",
            meaning: "havo",
            plural: "airs",
            others: [
                {
                    meaning: "shabada",
                    examples: [{ phrase: "evening air", translation: "kechki shabada" }],
                },
                {
                    meaning: "shamol",
                    examples: [{ phrase: "air pollution", translation: "havosining ifloslanishi" }],
                },
            ],
        },
    ],
    usageFrequency: 443,
    synonyms: [
        "atmosphere",
        "aeroplane",
        "aerosphere",
    ],
    examples: [
        {
            phrase: "without air and water, nothing could live.",
            translation: "havo va suvsiz hech narsa yashay olmaydi.",
        },
    ],
    verbforms: [
        {
            tense: "simple",
            content: [
                {
                    title: "Present Simple",
                    forms: [
                        {
                            singular: "I air",
                            plural: "We air",
                        },
                        {
                            singular: "You air",
                            plural: "You air",
                        },
                        {
                            singular: "He/She/It airs",
                            plural: "They air",
                        },
                    ],
                },
                {
                    title: "Past Simple",
                    forms: [
                        {
                            singular: "I aired",
                            plural: "We aired",
                        },
                        {
                            singular: "You aired",
                            plural: "You aired",
                        },
                        {
                            singular: "He/She/It aired",
                            plural: "They aired",
                        },
                    ],
                },
                {
                    title: "Future Simple",
                    forms: [
                        {
                            singular: "I will air",
                            plural: "We will air",
                        },
                        {
                            singular: "You will air",
                            plural: "You will air",
                        },
                        {
                            singular: "He/She/It will air",
                            plural: "They will air",
                        },
                    ],
                },
            ],
        },
    ],
    anagrams: ["ira"],
};

export const irregularVerbs: IrregularVerb[] = [
    {
        baseForm: "arise",
        pastSimple: "arose",
        pastParticiple: "arisen",
        meaning: "paydo bo'lmoq",
    },
];

const comments = [
    {
        user: "Malika",
        text: "Yangi fe'llarni tezroq o'rganish uchun juda yaxshi usul!",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
