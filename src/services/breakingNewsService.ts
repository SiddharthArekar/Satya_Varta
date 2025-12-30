import { fetchNews } from './newsService';
import { NewsArticle } from '@/components/NewsCard';
import { notificationService } from './notificationService';

interface BreakingNewsData {
  articles: NewsArticle[];
  lastCheck: number;
  notifiedArticles: Set<string>;
}

class BreakingNewsService {
  private breakingNewsData: BreakingNewsData = {
    articles: [],
    lastCheck: Date.now(),
    notifiedArticles: new Set()
  };
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // AI-powered breaking news keywords and patterns
  private readonly BREAKING_NEWS_INDICATORS = [
    'breaking', 'urgent', 'alert', 'emergency', 'developing', 'live',
    'explosion', 'earthquake', 'tsunami', 'fire', 'crash', 'attack',
    'death', 'killed', 'injured', 'dead', 'crisis', 'disaster',
    'storm', 'flood', 'hurricane', 'tornado', 'accident', 'shooting',
    'bomb', 'terror', 'war', 'conflict', 'resign', 'resignation',
    'arrest', 'arrested', 'charged', 'convicted', 'verdict', 'sentenced'
  ];

  private readonly HIGH_PRIORITY_SOURCES = [
    'bbc', 'cnn', 'reuters', 'ap', 'bloomberg', 'guardian', 'wsj', 'nytimes'
  ];

  async startMonitoring() {
    console.log('Starting breaking news monitoring...');
    
    // Initial check
    await this.checkForBreakingNews();
    
    // Set up polling
    this.pollingInterval = setInterval(() => {
      this.checkForBreakingNews();
    }, this.POLLING_INTERVAL);
  }

  stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    console.log('Stopped breaking news monitoring');
  }

  async checkForBreakingNews() {
    try {
      const preferences = notificationService.getPreferences();
      
      if (!preferences.enabled || !preferences.breakingNews) {
        return;
      }

      console.log('Checking for breaking news...');
      
      // Fetch latest news
      const allNews = await fetchNews('all');
      
      // Filter and prioritize using AI
      const breakingNews = this.prioritizeBreakingNews(allNews);
      
      // Check for new breaking news
      const newBreakingNews = breakingNews.filter(article => 
        !this.breakingNewsData.notifiedArticles.has(article.id) &&
        new Date(article.publishedAt).getTime() > this.breakingNewsData.lastCheck
      );

      if (newBreakingNews.length > 0) {
        console.log(`Found ${newBreakingNews.length} new breaking news articles`);
        
        // Send notifications for new breaking news
        for (const article of newBreakingNews) {
          await this.sendBreakingNewsNotification(article);
          this.breakingNewsData.notifiedArticles.add(article.id);
        }
        
        // Update breaking news data
        this.breakingNewsData.articles = breakingNews;
        this.breakingNewsData.lastCheck = Date.now();
      }
      
    } catch (error) {
      console.error('Error checking for breaking news:', error);
    }
  }

  private prioritizeBreakingNews(articles: NewsArticle[]): NewsArticle[] {
    const now = Date.now();
    const twoHoursAgo = now - (2 * 60 * 60 * 1000); // 2 hours ago

    return articles
      .filter(article => {
        // Only consider recent articles
        const publishedTime = new Date(article.publishedAt).getTime();
        return publishedTime > twoHoursAgo;
      })
      .map(article => ({
        ...article,
        breakingScore: this.calculateBreakingScore(article)
      }))
      .filter(article => article.breakingScore > 0.3) // Minimum breaking news threshold
      .sort((a, b) => b.breakingScore - a.breakingScore)
      .slice(0, 10); // Top 10 breaking news
  }

  private calculateBreakingScore(article: NewsArticle): number {
    let score = 0;
    const title = article.title.toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = `${title} ${description}`;

    // Check for breaking news keywords (weighted scoring)
    const urgentKeywords = ['breaking', 'urgent', 'alert', 'live', 'developing'];
    const moderateKeywords = ['emergency', 'crisis', 'disaster', 'attack'];
    const eventKeywords = ['explosion', 'earthquake', 'fire', 'crash', 'shooting'];

    urgentKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.4;
    });

    moderateKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.3;
    });

    eventKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.2;
    });

    // Boost score for high-priority sources
    if (this.HIGH_PRIORITY_SOURCES.some(source => 
      article.source.toLowerCase().includes(source))) {
      score += 0.2;
    }

    // Time-based scoring (more recent = higher score)
    const publishedTime = new Date(article.publishedAt).getTime();
    const now = Date.now();
    const hoursAgo = (now - publishedTime) / (1000 * 60 * 60);
    
    if (hoursAgo < 0.5) score += 0.3; // Last 30 minutes
    else if (hoursAgo < 1) score += 0.2; // Last hour
    else if (hoursAgo < 2) score += 0.1; // Last 2 hours

    // Category-based scoring
    const highPriorityCategories = ['world', 'politics'];
    if (highPriorityCategories.includes(article.category)) {
      score += 0.1;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private async sendBreakingNewsNotification(article: NewsArticle) {
    const title = '🚨 Breaking News';
    const body = article.title.length > 100 
      ? article.title.substring(0, 97) + '...'
      : article.title;

    try {
      await notificationService.showLocalNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `breaking-${article.id}`,
        requireInteraction: true,
        data: {
          articleId: article.id,
          url: article.url
        }
      });

      console.log(`Breaking news notification sent for: ${article.title}`);
    } catch (error) {
      console.error('Failed to send breaking news notification:', error);
    }
  }

  getBreakingNews(): NewsArticle[] {
    return this.breakingNewsData.articles;
  }

  isBreakingNews(articleId: string): boolean {
    return this.breakingNewsData.articles.some(article => article.id === articleId);
  }

  clearNotificationHistory() {
    this.breakingNewsData.notifiedArticles.clear();
  }
}

export const breakingNewsService = new BreakingNewsService();