'use client';

import { useState } from 'react';
import { Award } from '../app/api/spending_company';
import { useMemo } from 'react';
import AnalysisSidebar from './AnalysisSidebar';

interface CompanyListProps {
  awards: Award[];
}

interface CompanyData {
  totalAmount: number;
  contractCount: number;
  latestContract: Award;
  contracts: Award[];
}

type CompanyDataRecord = Record<string, CompanyData>;

export default function CompanyList({ awards }: CompanyListProps) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const companyData = useMemo(() => {
    const groupedByCompany = awards.reduce((acc, award) => {
      const company = award.recipient_id;
      if (!acc[company]) {
        acc[company] = {
          totalAmount: 0,
          contractCount: 0,
          latestContract: award,
          contracts: []
        };
      }
      acc[company].totalAmount += award.amount;
      acc[company].contractCount += 1;
      acc[company].contracts.push(award);
      
      const currentDate = new Date(award.date || award.action_date || award.award_date || Date.now());
      const latestDate = new Date(
        acc[company].latestContract.date || 
        acc[company].latestContract.action_date || 
        acc[company].latestContract.award_date || 
        Date.now()
      );
      
      if (currentDate > latestDate) {
        acc[company].latestContract = award;
      }
      
      return acc;
    }, {} as CompanyDataRecord);

    return Object.entries(groupedByCompany)
      .sort(([, a], [, b]) => b.totalAmount - a.totalAmount);
  }, [awards]);

  const handleAnalysisClick = (company: string) => {
    setSelectedCompany(company);
    setIsSidebarOpen(true);
  };

  if (companyData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Companies Found</h3>
        <p className="text-gray-600 mb-4">
          No public companies found in the contract data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companyData.map(([company, data]) => (
        <div key={company} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{company}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Contracts: {data.contractCount}</span>
                <span>Total Value: {formatCurrency(data.totalAmount)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <a
                href={`https://www.sec.gov/edgar/search/#/entityName=${encodeURIComponent(company)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                SEC Filings →
              </a>
              <button
                onClick={() => handleAnalysisClick(company)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Our Analysis →
              </button>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Contract</h4>
            <p className="text-sm text-gray-600">{data.latestContract.description}</p>
          </div>
        </div>
      ))}

      {selectedCompany && (
        <AnalysisSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          company={selectedCompany}
          companyData={Object.fromEntries(companyData)[selectedCompany]}
        />
      )}
    </div>
  );
} 