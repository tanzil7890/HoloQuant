
import { Suspense } from 'react';
import { getSpendingData } from '../api/spending';
import StatsOverview from '@/components/StatsOverview';
import CompanyList from '@/components/CompanyList';
import Navigation from '@/components/Navigation';

function LoadingSpinner() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

async function CompanyMonitor() {
  const awards = await getSpendingData();
  
  return (
    <>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Public Company Contract Monitor
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Track government contracts awarded to publicly traded companies
        </p>
      </div>
      <StatsOverview awards={awards} />
      <CompanyList awards={awards} />
    </>
  );
}

export default function MonitorCompanies() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <Suspense fallback={<LoadingSpinner />}>
            <CompanyMonitor />
          </Suspense>
        </div>
      </main>
    </>
  );
} 