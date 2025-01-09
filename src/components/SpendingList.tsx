'use client';

import { Award } from '../app/api/spending';
import { useMemo } from 'react';

interface SpendingListProps {
  awards: Award[];
}

export default function SpendingList({ awards }: SpendingListProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) return 'Amount not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const memoizedAwards = useMemo(() => awards, [awards]);

  if (!memoizedAwards || memoizedAwards.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Awards Found</h3>
        <p className="text-gray-600 mb-4">
          No government contracts found for the specified criteria.
        </p>
        <p className="text-sm text-gray-500">
          Try adjusting the search parameters or check back later for updated data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {memoizedAwards.map((award) => (
        <div 
          key={award.id} 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {award.agency}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 text-sm">
                  {formatDate(award.date)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {award.recipient}
              </h3>
              <p className="text-gray-700 line-clamp-2">{award.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {formatCurrency(award.amount)}
              </p>
              <a 
                href={`https://www.usaspending.gov/award/${award.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 