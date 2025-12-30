import React, { useState } from 'react';
import AnimatedGlowingSearchBar from './animated-glowing-search-bar';

const AnimatedSearchDemo = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // You can add your search logic here
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h2 className="text-white text-2xl font-bold mb-8 text-center">
          Animated Glowing Search Bar Demo
        </h2>
        <AnimatedGlowingSearchBar
          placeholder="Search anything..."
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
        />
        {searchQuery && (
          <div className="mt-4 text-white text-center">
            <p>Current search: "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedSearchDemo;
