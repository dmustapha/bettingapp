'use client';

import { useState, useMemo } from 'react';
import { searchTokens, getTokensForCategory, TOKEN_CATEGORIES, TokenCategory, TokenConfig } from '@/config/tokens.config';

interface TokenSearchProps {
  onTokenSelect?: (token: TokenConfig) => void;
  selectedCategory?: TokenCategory;
  onCategoryChange?: (category: TokenCategory) => void;
}

export function TokenSearch({ onTokenSelect, selectedCategory = 'All', onCategoryChange }: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    let tokens = getTokensForCategory(selectedCategory);

    if (searchQuery.trim()) {
      tokens = searchTokens(searchQuery);
      // Further filter by category if not "All"
      if (selectedCategory !== 'All' && selectedCategory !== 'Featured') {
        tokens = tokens.filter((token) => token.category === selectedCategory);
      }
    }

    return tokens;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tokens by name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TOKEN_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange?.(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {filteredTokens.length} {filteredTokens.length === 1 ? 'token' : 'tokens'} found
        </div>

        {filteredTokens.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600 dark:text-gray-400">
              No tokens found matching your search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => onTokenSelect?.(token)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all text-left group"
              >
                <span className="text-3xl">{token.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {token.symbol}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {token.name}
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {token.category}
                    </span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact token selector for forms
 */
export function TokenSelector({ value, onChange }: { value?: string; onChange?: (symbol: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<TokenCategory>('All');
  const [search, setSearch] = useState('');

  const tokens = useMemo(() => {
    let filtered = getTokensForCategory(category);
    if (search.trim()) {
      filtered = searchTokens(search);
    }
    return filtered;
  }, [category, search]);

  const selectedToken = value ? tokens.find((t) => t.symbol === value) : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between"
      >
        {selectedToken ? (
          <span className="flex items-center gap-2">
            <span className="text-2xl">{selectedToken.icon}</span>
            <span className="font-medium">{selectedToken.symbol}</span>
            <span className="text-sm text-gray-500">- {selectedToken.name}</span>
          </span>
        ) : (
          <span className="text-gray-500">Select a token...</span>
        )}
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-1 mt-2 overflow-x-auto">
              {['All', 'Featured', 'DeFi', 'Base Ecosystem', 'Stablecoin'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as TokenCategory)}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    category === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  onChange?.(token.symbol);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full flex items-center gap-3 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-2xl">{token.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{token.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{token.name}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {token.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
