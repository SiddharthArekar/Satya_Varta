import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translateText, SUPPORTED_LANGUAGES, detectLanguage, getTranslationStats } from '@/services/translationService';
import { Languages, Zap, Globe, Loader2 } from 'lucide-react';

export const TranslationTest: React.FC = () => {
  const [text, setText] = useState('Hello, this is a test of the Google Translate API integration.');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(getTranslationStats());

  const handleTranslate = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('🧪 Testing Google Translate API...');
      const result = await translateText(text, targetLanguage);
      setTranslatedText(result);
      console.log('✅ Translation result:', result);
    } catch (error) {
      console.error('❌ Translation failed:', error);
      setTranslatedText('Translation failed. Check console for details.');
    } finally {
      setIsLoading(false);
      setStats(getTranslationStats());
    }
  };

  const handleDetectLanguage = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 Detecting language...');
      const detected = await detectLanguage(text);
      setDetectedLanguage(detected);
      console.log('✅ Detected language:', detected);
    } catch (error) {
      console.error('❌ Language detection failed:', error);
      setDetectedLanguage('Detection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testPresetTranslations = async () => {
    const testTexts = [
      'Latest News',
      'Technology',
      'Business',
      'Sports',
      'Health',
      'Science',
      'Entertainment',
      'World'
    ];

    setIsLoading(true);
    try {
      console.log('🧪 Testing preset translations...');
      for (const testText of testTexts) {
        const result = await translateText(testText, targetLanguage);
        console.log(`"${testText}" → "${result}"`);
      }
      console.log('✅ All preset translations completed');
    } catch (error) {
      console.error('❌ Preset translation test failed:', error);
    } finally {
      setIsLoading(false);
      setStats(getTranslationStats());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Google Translate API Test
          </CardTitle>
          <CardDescription>
            Test the Google Translate API integration with real-time translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text to Translate</Label>
              <Input
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language-select">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleTranslate} 
              disabled={isLoading || !text.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              Translate
            </Button>
            
            <Button 
              onClick={handleDetectLanguage} 
              disabled={isLoading || !text.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Detect Language
            </Button>
            
            <Button 
              onClick={testPresetTranslations} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Test Presets
            </Button>
          </div>

          {translatedText && (
            <div className="space-y-2">
              <Label>Translation Result</Label>
              <div className="p-3 bg-muted rounded-lg border">
                <p className="text-sm font-medium mb-1">Translated:</p>
                <p className="text-foreground">{translatedText}</p>
              </div>
            </div>
          )}

          {detectedLanguage && (
            <div className="space-y-2">
              <Label>Language Detection</Label>
              <div className="p-3 bg-muted rounded-lg border">
                <p className="text-sm font-medium mb-1">Detected Language:</p>
                <p className="text-foreground">{detectedLanguage}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Translation Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.cacheSize}</div>
              <div className="text-sm text-muted-foreground">Cached Translations</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.supportedLanguages}</div>
              <div className="text-sm text-muted-foreground">Supported Languages</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.apiKey}</div>
              <div className="text-sm text-muted-foreground">API Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p><strong>Note:</strong> Check the browser console (F12) for detailed API logs.</p>
        <p>The translation service uses Google Translate API with caching for better performance.</p>
      </div>
    </div>
  );
};
