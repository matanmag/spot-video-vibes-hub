
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResults from '@/components/SearchResults';
import SearchBar from '@/components/SearchBar';

const Search = () => {
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl font-bold text-white">Search</h1>
          </div>
          
          <div className="max-w-md mx-auto">
            <SearchBar autoFocus />
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-140px)]">
        <SearchResults query={currentQuery} />
      </div>
    </div>
  );
};

export default Search;
