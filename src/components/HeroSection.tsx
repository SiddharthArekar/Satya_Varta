import { useState, useEffect } from "react";
import { TrendingUp, Users, Globe, Zap, Shield, Clock, ArrowRight, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/news-hero.jpg";

export const HeroSection = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Live stats rotation
  const liveStats = [
    { label: "Breaking News", value: "12", icon: Zap, color: "text-red-500" },
    { label: "Trusted Sources", value: "500+", icon: Shield, color: "text-green-500" },
    { label: "Global Coverage", value: "180+", icon: Globe, color: "text-blue-500" },
    { label: "Real-time Updates", value: "24/7", icon: Clock, color: "text-purple-500" }
  ];

  // Rotate stats every 3 seconds
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % liveStats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, liveStats.length]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = liveStats[currentStat].icon;

  // Button handlers
  const handleExploreNews = () => {
    // Scroll to news section
    const newsSection = document.querySelector('[data-news-section]');
    if (newsSection) {
      newsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrending = () => {
    // Navigate to trending category or scroll to news with trending filter
    const newsSection = document.querySelector('[data-news-section]');
    if (newsSection) {
      newsSection.scrollIntoView({ behavior: 'smooth' });
      // Trigger technology category (most trending) or business category
      setTimeout(() => {
        const trendingButton = document.querySelector('[data-category="technology"]') || 
                              document.querySelector('[data-category="business"]') ||
                              document.querySelector('[data-category="all"]');
        if (trendingButton) {
          (trendingButton as HTMLElement).click();
        }
      }, 500);
    }
  };

  return (
    <section className="relative overflow-hidden mx-4 mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-card via-card/90 to-card/70 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary animate-fade-in">
                <div className="w-8 h-8 luxury-gradient rounded-xl flex items-center justify-center animate-bounce">
                  <Globe className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-medium text-sm">Stay Informed • Real-time Updates</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight animate-slide-up">
                Your Premium
                <span className="news-gradient bg-clip-text text-transparent block animate-gradient">
                  News Experience
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in delay-300">
                Discover breaking news, in-depth analysis, and trending stories from trusted sources worldwide. 
                Stay ahead with our AI-powered personalized news feed.
              </p>
            </div>

            {/* Interactive Live Stats */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:scale-105 transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-primary" />
                  ) : (
                    <Play className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">Live Stats</span>
                </button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Animated stats display */}
              <div className="glass-card p-6 rounded-xl border border-card-border/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10 ${liveStats[currentStat].color}`}>
                      <CurrentIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-lg animate-counter">
                        {liveStats[currentStat].value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {liveStats[currentStat].label}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {liveStats.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentStat ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExploreNews}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-all duration-200 hover:shadow-lg active:scale-95 hover:bg-primary/90"
                >
                  <span className="text-sm font-medium">Explore News</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={handleTrending}
                  className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:scale-105 transition-all duration-200 active:scale-95 hover:shadow-lg hover:border-success/50"
                >
                  <TrendingUp className="h-4 w-4 text-success group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Trending</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Hero Image with animations */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-luxury)] group">
              <img
                src={heroImage}
                alt="Modern news interface with multiple screens showing various news categories"
                className="w-full h-[300px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card/20 via-transparent to-transparent"></div>
              
              {/* Floating elements */}
              <div className="absolute top-4 left-4 glass-card p-3 rounded-lg border border-card-border/50 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-foreground">LIVE</span>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 glass-card p-3 rounded-lg border border-card-border/50 animate-float delay-500">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-medium text-foreground">BREAKING</span>
                </div>
              </div>
              
              {/* Enhanced floating stats card */}
              <div className="absolute bottom-4 right-4 glass-card p-4 border border-card-border/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-foreground text-lg animate-counter">24/7</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Animated news ticker */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card/80 to-transparent p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-scroll">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  <span>Latest: Global markets show positive trends • Tech stocks rally • Climate summit updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};