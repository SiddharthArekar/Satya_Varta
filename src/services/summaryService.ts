import { NewsArticle } from "@/components/NewsCard";

export interface NewsSummary {
  bulletPoints: string[];
  readTime: string;
  keyTakeaways: string[];
}

// Simple extractive summarization for demo - you can replace with OpenAI/HuggingFace
const extractiveSummarize = (text: string): NewsSummary => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const words = text.split(' ').length;
  const readTime = Math.max(1, Math.ceil(words / 200)); // ~200 words per minute
  
  // Simple scoring based on sentence length and position
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Position bonus (first and last sentences often important)
    if (index < 2) score += 2;
    if (index >= sentences.length - 2) score += 1;
    
    // Length bonus (not too short, not too long)
    const wordCount = sentence.trim().split(' ').length;
    if (wordCount >= 10 && wordCount <= 25) score += 2;
    
    // Keywords bonus
    const keywords = ['said', 'according', 'reported', 'announced', 'revealed', 'confirmed'];
    keywords.forEach(keyword => {
      if (sentence.toLowerCase().includes(keyword)) score += 1;
    });
    
    return { sentence: sentence.trim(), score };
  }).sort((a, b) => b.score - a.score);
  
  const bulletPoints = scoredSentences
    .slice(0, Math.min(4, sentences.length))
    .map(item => item.sentence)
    .filter(s => s.length > 0);
    
  // Generate key takeaways (simplified)
  const keyTakeaways = bulletPoints.slice(0, 2);
  
  return {
    bulletPoints,
    readTime: `${readTime} min read`,
    keyTakeaways
  };
};

// Advanced AI summarization using OpenAI-compatible API
const aiSummarize = async (text: string): Promise<NewsSummary> => {
  try {
    // This would be replaced with actual API call to OpenAI, Anthropic, or local models
    const prompt = `Summarize this news article into 3-4 bullet points and 2 key takeaways:

Article: ${text}

Format:
BULLET POINTS:
• Point 1
• Point 2
• Point 3

KEY TAKEAWAYS:
• Takeaway 1
• Takeaway 2`;

    // For demo, falling back to extractive method
    // In production, you'd call: await openai.chat.completions.create({...})
    return extractiveSummarize(text);
    
  } catch (error) {
    console.warn('AI summarization failed, falling back to extractive method:', error);
    return extractiveSummarize(text);
  }
};

export const summarizeArticle = async (article: NewsArticle): Promise<NewsSummary> => {
  const textToSummarize = `${article.title}. ${article.description}`;
  
  // Try AI first, fall back to extractive
  try {
    return await aiSummarize(textToSummarize);
  } catch (error) {
    console.warn('Summarization failed:', error);
    return extractiveSummarize(textToSummarize);
  }
};

// Cache for summaries to avoid re-processing
const summaryCache = new Map<string, NewsSummary>();

export const getCachedSummary = (articleId: string): NewsSummary | null => {
  return summaryCache.get(articleId) || null;
};

export const setCachedSummary = (articleId: string, summary: NewsSummary): void => {
  summaryCache.set(articleId, summary);
};