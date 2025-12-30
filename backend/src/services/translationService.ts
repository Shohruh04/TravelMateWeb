import { prisma } from '../db/client';

/**
 * Translation Service
 * Provides travel phrases in multiple languages
 */

export interface PhraseCategory {
  [category: string]: Array<{
    english: string;
    translated: string;
    pronunciation?: string;
  }>;
}

export interface LanguagePhrases {
  language: string;
  languageCode: string;
  categories: PhraseCategory;
}

/**
 * Get all available languages with phrase counts
 */
export async function getAvailableLanguages() {
  const languages = await prisma.travelPhrase.groupBy({
    by: ['language', 'languageCode'],
    _count: {
      id: true,
    },
  });

  return languages.map(lang => ({
    language: lang.language,
    languageCode: lang.languageCode,
    phraseCount: lang._count.id,
  }));
}

/**
 * Get all phrases for all languages
 */
export async function getAllPhrases(): Promise<LanguagePhrases[]> {
  const phrases = await prisma.travelPhrase.findMany({
    orderBy: [
      { language: 'asc' },
      { category: 'asc' },
    ],
  });

  // Group by language
  const languageMap = new Map<string, LanguagePhrases>();

  phrases.forEach(phrase => {
    if (!languageMap.has(phrase.languageCode)) {
      languageMap.set(phrase.languageCode, {
        language: phrase.language,
        languageCode: phrase.languageCode,
        categories: {},
      });
    }

    const langData = languageMap.get(phrase.languageCode)!;

    if (!langData.categories[phrase.category]) {
      langData.categories[phrase.category] = [];
    }

    langData.categories[phrase.category].push({
      english: phrase.english,
      translated: phrase.translated,
      pronunciation: phrase.pronunciation || undefined,
    });
  });

  return Array.from(languageMap.values());
}

/**
 * Get phrases for a specific language
 */
export async function getPhrasesByLanguage(languageCode: string): Promise<LanguagePhrases | null> {
  const phrases = await prisma.travelPhrase.findMany({
    where: {
      languageCode: languageCode.toLowerCase(),
    },
    orderBy: {
      category: 'asc',
    },
  });

  if (phrases.length === 0) {
    return null;
  }

  const categories: PhraseCategory = {};

  phrases.forEach(phrase => {
    if (!categories[phrase.category]) {
      categories[phrase.category] = [];
    }

    categories[phrase.category].push({
      english: phrase.english,
      translated: phrase.translated,
      pronunciation: phrase.pronunciation || undefined,
    });
  });

  return {
    language: phrases[0].language,
    languageCode: phrases[0].languageCode,
    categories,
  };
}

/**
 * Get phrases by category across all languages
 */
export async function getPhrasesByCategory(category: string) {
  const phrases = await prisma.travelPhrase.findMany({
    where: {
      category: category.toLowerCase(),
    },
    orderBy: {
      language: 'asc',
    },
  });

  // Group by language
  const languageMap = new Map<string, any>();

  phrases.forEach(phrase => {
    if (!languageMap.has(phrase.languageCode)) {
      languageMap.set(phrase.languageCode, {
        language: phrase.language,
        languageCode: phrase.languageCode,
        phrases: [],
      });
    }

    languageMap.get(phrase.languageCode)!.phrases.push({
      english: phrase.english,
      translated: phrase.translated,
      pronunciation: phrase.pronunciation || undefined,
    });
  });

  return Array.from(languageMap.values());
}

/**
 * Search phrases by English text
 */
export async function searchPhrases(query: string) {
  const phrases = await prisma.travelPhrase.findMany({
    where: {
      OR: [
        { english: { contains: query, mode: 'insensitive' } },
        { translated: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 50, // Limit results
  });

  return phrases.map(phrase => ({
    language: phrase.language,
    languageCode: phrase.languageCode,
    category: phrase.category,
    english: phrase.english,
    translated: phrase.translated,
    pronunciation: phrase.pronunciation || undefined,
  }));
}
