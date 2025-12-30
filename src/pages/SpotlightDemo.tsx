import { SpotlightNewsCard } from "@/components/ui/spotlight-news-card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Globe, Building2, Laptop, Trophy, Film, Heart, Microscope } from "lucide-react";

const SpotlightDemo = () => {
  const demoArticles = [
    {
      id: '1',
      title: 'Revolutionary AI Technology Transforms Healthcare',
      description: 'New artificial intelligence breakthrough promises to revolutionize medical diagnosis and treatment, potentially saving millions of lives worldwide.',
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      publishedAt: new Date().toISOString(),
      source: 'TechNews',
      category: 'technology' as const,
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Global Climate Summit Reaches Historic Agreement',
      description: 'World leaders unite in unprecedented climate action plan that could significantly reduce global carbon emissions by 2030.',
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1569163139394-de6e4a6b8a4e?w=400&h=300&fit=crop',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: 'WorldNews',
      category: 'world' as const,
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Stock Market Reaches All-Time High',
      description: 'Major indices surge as investors show renewed confidence in economic recovery and technological innovation.',
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: 'FinanceDaily',
      category: 'business' as const,
      isBookmarked: false
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl text-foreground mb-4">
            Spotlight Cards Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Interactive glow cards that follow your mouse cursor
          </p>
        </div>

        {/* Basic Glow Cards */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-foreground mb-8">
            Basic Glow Cards
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <GlowCard glowColor="blue">
              <div className="p-6">
                <Badge className="mb-4">Blue Glow</Badge>
                <h3 className="font-semibold text-lg mb-2">Interactive Card</h3>
                <p className="text-muted-foreground text-sm">
                  Move your mouse around to see the glow effect follow your cursor.
                </p>
              </div>
            </GlowCard>
            
            <GlowCard glowColor="purple">
              <div className="p-6">
                <Badge className="mb-4">Purple Glow</Badge>
                <h3 className="font-semibold text-lg mb-2">Beautiful Animation</h3>
                <p className="text-muted-foreground text-sm">
                  Smooth transitions and beautiful color gradients create an immersive experience.
                </p>
              </div>
            </GlowCard>
            
            <GlowCard glowColor="green">
              <div className="p-6">
                <Badge className="mb-4">Green Glow</Badge>
                <h3 className="font-semibold text-lg mb-2">Responsive Design</h3>
                <p className="text-muted-foreground text-sm">
                  Works perfectly on all screen sizes and devices.
                </p>
              </div>
            </GlowCard>
          </div>
        </section>

        {/* News Cards with Spotlight */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-foreground mb-8">
            News Cards with Spotlight Effect
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoArticles.map((article) => (
              <SpotlightNewsCard
                key={article.id}
                article={article}
                onBookmark={() => console.log('Bookmark clicked')}
                onRead={() => console.log('Read clicked')}
                onSummary={() => console.log('Summary clicked')}
                onFactCheck={() => console.log('Fact check clicked')}
              />
            ))}
          </div>
        </section>

        {/* Color Variations */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-foreground mb-8">
            Color Variations
          </h2>
          <div className="grid gap-6 md:grid-cols-5">
            {['blue', 'purple', 'green', 'red', 'orange'].map((color) => (
              <GlowCard 
                key={color}
                glowColor={color as any}
                size="sm"
              >
                <div className="p-4 text-center">
                  <Badge className="mb-2 capitalize">{color}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {color.charAt(0).toUpperCase() + color.slice(1)} glow
                  </p>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl text-foreground mb-4">
              How to Use Spotlight Cards
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• Move your mouse cursor over the cards to see the glow effect</p>
              <p>• The glow follows your cursor in real-time</p>
              <p>• Different colors create different visual experiences</p>
              <p>• Perfect for creating engaging, interactive interfaces</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SpotlightDemo;
