import { getSpendingData } from './api/spending';
import SpendingList from '@/components/SpendingList';
import StatsOverview from '@/components/StatsOverview';
import Navigation from '@/components/Navigation';
import { Suspense } from 'react';

function LoadingSpinner() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

async function AwardsList() {
  const awards = await getSpendingData();
  return (
    <>
    <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Government Spending Tracker
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tracking all government contract awards and spending
            </p>
          </div>
      <StatsOverview awards={awards} />
      <SpendingList awards={awards} />
    </>
  );
}

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <Suspense fallback={<LoadingSpinner />}>
            <AwardsList />
          </Suspense>
        </div>
      </main>
    </>
  );
}
