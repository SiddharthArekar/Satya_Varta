import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testGoogleFactCheckAPI, checkFactWithGoogle } from '@/services/factCheckService';

export const GoogleFactCheckTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [testQuery, setTestQuery] = useState('');

  const runTest = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      console.log('🧪 Running Google Fact Check API test...');
      await testGoogleFactCheckAPI();
      
      // Test with a specific query
      if (testQuery.trim()) {
        console.log(`🔍 Testing custom query: ${testQuery}`);
        const customResults = await checkFactWithGoogle(testQuery);
        setResults(customResults);
        console.log('📊 Custom query results:', customResults);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Google Fact Check API Test</CardTitle>
        <CardDescription>
          Test the Google Fact Check API with well-known fact-checked claims
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="test-query" className="text-sm font-medium">
            Test Query (optional):
          </label>
          <input
            id="test-query"
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g., 'COVID-19 vaccine causes autism'"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Run Google Fact Check Test'}
        </Button>
        
        {results.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <p><strong>Claim:</strong> {result.claim}</p>
                  <p><strong>Verdict:</strong> {result.verdict}</p>
                  <p><strong>Source:</strong> {result.source}</p>
                  <p><strong>Confidence:</strong> {Math.round(result.confidence * 100)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> Check the browser console (F12) for detailed logs.</p>
          <p>The test will try these well-known fact-checked claims:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>COVID-19 vaccine causes autism</li>
            <li>climate change is a hoax</li>
            <li>2020 election was stolen</li>
            <li>vaccines contain microchips</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
