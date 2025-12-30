import { NewsArticle } from "@/components/NewsCard";
import API_CONFIGS from "@/config/apiConfig";

export interface DetailedNewsContent {
  id: string;
  title: string;
  description: string;
  content: string;
  fullText: string;
  author?: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  source: string;
  category: string;
  tags?: string[];
  relatedArticles?: NewsArticle[];
  wordCount?: number;
  readingTime?: number;
  credibilityScore?: number;
  lastUpdated?: string;
}

export interface DetailedNewsResponse {
  success: boolean;
  data?: DetailedNewsContent;
  error?: string;
  sources?: string[];
}

class DetailedNewsService {
  private cache = new Map<string, DetailedNewsContent>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private getCacheKey(articleId: string): string {
    return `detailed_${articleId}`;
  }

  private getCachedContent(articleId: string): DetailedNewsContent | null {
    const key = this.getCacheKey(articleId);
    const cached = this.cache.get(key);
    
    if (cached && cached.lastUpdated) {
      const age = Date.now() - new Date(cached.lastUpdated).getTime();
      if (age < this.CACHE_DURATION) {
        return cached;
      }
    }
    
    this.cache.delete(key);
    return null;
  }

  private setCachedContent(articleId: string, content: DetailedNewsContent): void {
    const key = this.getCacheKey(articleId);
    this.cache.set(key, content);
  }

  private async fetchFromNewsAPI(article: NewsArticle): Promise<DetailedNewsContent | null> {
    try {
      const config = API_CONFIGS.newsapi;
      if (!config.enabled) return null;

      // Try to get full article content using the URL
      const response = await fetch(
        `https://api.newsapi.org/v2/everything?q=${encodeURIComponent(article.title)}&apiKey=${config.apiKey}&pageSize=1&sortBy=relevancy`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const newsApiArticle = data.articles?.[0];

      if (newsApiArticle && newsApiArticle.content) {
        return {
          id: article.id,
          title: article.title,
          description: article.description,
          content: newsApiArticle.content,
          fullText: newsApiArticle.content,
          author: newsApiArticle.author,
          publishedAt: article.publishedAt,
          url: article.url,
          imageUrl: article.imageUrl,
          source: article.source,
          category: article.category,
          wordCount: newsApiArticle.content.split(' ').length,
          readingTime: Math.ceil(newsApiArticle.content.split(' ').length / 200),
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
    }
    return null;
  }

  private async fetchFromGuardian(article: NewsArticle): Promise<DetailedNewsContent | null> {
    try {
      const config = API_CONFIGS.guardian;
      if (!config.enabled) return null;

      // Try to find article by title
      const response = await fetch(
        `https://content.guardianapis.com/search?q=${encodeURIComponent(article.title)}&api-key=${config.apiKey}&show-fields=body,byline,thumbnail&page-size=1`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const guardianArticle = data.response?.results?.[0];

      if (guardianArticle && guardianArticle.fields?.body) {
        return {
          id: article.id,
          title: article.title,
          description: article.description,
          content: guardianArticle.fields.body,
          fullText: guardianArticle.fields.body,
          author: guardianArticle.fields.byline,
          publishedAt: article.publishedAt,
          url: article.url,
          imageUrl: guardianArticle.fields.thumbnail || article.imageUrl,
          source: article.source,
          category: article.category,
          wordCount: guardianArticle.fields.body.split(' ').length,
          readingTime: Math.ceil(guardianArticle.fields.body.split(' ').length / 200),
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error fetching from Guardian:', error);
    }
    return null;
  }

  private async fetchFromNYTimes(article: NewsArticle): Promise<DetailedNewsContent | null> {
    try {
      const config = API_CONFIGS.nytimes;
      if (!config.enabled) return null;

      // Try to find article by title
      const response = await fetch(
        `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(article.title)}&api-key=${config.apiKey}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const nytArticle = data.response?.docs?.[0];

      if (nytArticle && nytArticle.abstract) {
        return {
          id: article.id,
          title: article.title,
          description: article.description,
          content: nytArticle.abstract,
          fullText: nytArticle.abstract,
          author: nytArticle.byline?.original,
          publishedAt: article.publishedAt,
          url: article.url,
          imageUrl: nytArticle.multimedia?.[0] ? `https://www.nytimes.com/${nytArticle.multimedia[0].url}` : article.imageUrl,
          source: article.source,
          category: article.category,
          wordCount: nytArticle.abstract.split(' ').length,
          readingTime: Math.ceil(nytArticle.abstract.split(' ').length / 200),
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error fetching from NYTimes:', error);
    }
    return null;
  }

  private async fetchFromNewsData(article: NewsArticle): Promise<DetailedNewsContent | null> {
    try {
      const config = API_CONFIGS.newsdata;
      if (!config.enabled) return null;

      // Try to get content using the URL
      const response = await fetch(
        `https://newsdata.io/api/1/news?q=${encodeURIComponent(article.title)}&apikey=${config.apiKey}&language=en&page_size=1`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const newsDataArticle = data.results?.[0];

      if (newsDataArticle && newsDataArticle.content) {
        return {
          id: article.id,
          title: article.title,
          description: article.description,
          content: newsDataArticle.content,
          fullText: newsDataArticle.content,
          author: newsDataArticle.creator?.[0],
          publishedAt: article.publishedAt,
          url: article.url,
          imageUrl: newsDataArticle.image_url || article.imageUrl,
          source: article.source,
          category: article.category,
          tags: newsDataArticle.keywords,
          wordCount: newsDataArticle.content.split(' ').length,
          readingTime: Math.ceil(newsDataArticle.content.split(' ').length / 200),
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error fetching from NewsData:', error);
    }
    return null;
  }

  private async fetchFromArticleUrl(article: NewsArticle): Promise<DetailedNewsContent | null> {
    try {
      // Use a CORS proxy or server-side fetching
      // For now, we'll simulate content extraction
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(article.url)}`);
      
      if (!response.ok) return null;

      const data = await response.json();
      const htmlContent = data.contents;

      if (htmlContent) {
        // Basic HTML parsing to extract text content
        const textContent = htmlContent
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (textContent.length > 500) {
          return {
            id: article.id,
            title: article.title,
            description: article.description,
            content: textContent.substring(0, 2000) + (textContent.length > 2000 ? '...' : ''),
            fullText: textContent,
            publishedAt: article.publishedAt,
            url: article.url,
            imageUrl: article.imageUrl,
            source: article.source,
            category: article.category,
            wordCount: textContent.split(' ').length,
            readingTime: Math.ceil(textContent.split(' ').length / 200),
            lastUpdated: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('Error fetching from article URL:', error);
    }
    return null;
  }

  public async fetchDetailedContent(article: NewsArticle): Promise<DetailedNewsResponse> {
    try {
      // Check cache first
      const cached = this.getCachedContent(article.id);
      if (cached) {
        return {
          success: true,
          data: cached,
          sources: ['cache']
        };
      }

      const sources: string[] = [];
      let detailedContent: DetailedNewsContent | null = null;

      // Try each API in order of preference with timeout
      const apiFetchers = [
        { name: 'NewsAPI', fetcher: () => this.fetchFromNewsAPI(article) },
        { name: 'Guardian', fetcher: () => this.fetchFromGuardian(article) },
        { name: 'NYTimes', fetcher: () => this.fetchFromNYTimes(article) },
        { name: 'NewsData', fetcher: () => this.fetchFromNewsData(article) }
      ];

      for (const { name, fetcher } of apiFetchers) {
        try {
          // Add timeout for each API call
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 5000)
          );
          
          const result = await Promise.race([
            fetcher(),
            timeoutPromise
          ]);
          
          if (result) {
            detailedContent = result;
            sources.push(name);
            break;
          }
        } catch (error) {
          console.error(`Error fetching from ${name}:`, error);
          // Continue to next API
        }
      }

      if (detailedContent) {
        this.setCachedContent(article.id, detailedContent);
        return {
          success: true,
          data: detailedContent,
          sources
        };
      }

      // Fallback: create enhanced content from available data
      const fallbackContent: DetailedNewsContent = {
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.description || 'Full content not available. Click "Read Full Article" to view the complete story on the source website.',
        fullText: article.description || 'Full content not available.',
        publishedAt: article.publishedAt,
        url: article.url,
        imageUrl: article.imageUrl,
        source: article.source,
        category: article.category,
        wordCount: article.description?.split(' ').length || 0,
        readingTime: Math.ceil((article.description?.split(' ').length || 0) / 200),
        lastUpdated: new Date().toISOString()
      };

      this.setCachedContent(article.id, fallbackContent);
      
      return {
        success: true,
        data: fallbackContent,
        sources: ['fallback']
      };
    } catch (error) {
      console.error('Error in fetchDetailedContent:', error);
      
      // Return basic fallback even if everything fails
      const emergencyFallback: DetailedNewsContent = {
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.description || 'Content temporarily unavailable.',
        fullText: article.description || 'Content temporarily unavailable.',
        publishedAt: article.publishedAt,
        url: article.url,
        imageUrl: article.imageUrl,
        source: article.source,
        category: article.category,
        wordCount: article.description?.split(' ').length || 0,
        readingTime: Math.ceil((article.description?.split(' ').length || 0) / 200),
        lastUpdated: new Date().toISOString()
      };

      return {
        success: true,
        data: emergencyFallback,
        sources: ['emergency-fallback']
      };
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const detailedNewsService = new DetailedNewsService();
