'use client';

import { useState, useEffect, useRef } from 'react';
import { Award } from '../app/api/spending';
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
  yearlyContracts: Record<string, Award[]>;
}

type CompanyDataRecord = Record<string, CompanyData>;

export default function CompanyList({ awards }: CompanyListProps) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<string, Record<string, boolean>>>({});
  const [visibleCompanies, setVisibleCompanies] = useState(10); // Initial number of companies to show
  const loaderRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const companyData = useMemo(() => {
    if (!awards || awards.length === 0) {
      return [];
    }
    
    const groupedByCompany = awards.reduce((acc, award) => {
      const company = award.recipient;
      if (!acc[company]) {
        acc[company] = {
          totalAmount: 0,
          contractCount: 0,
          latestContract: award,
          contracts: [],
          yearlyContracts: {}
        };
      }
      acc[company].totalAmount += award.amount;
      acc[company].contractCount += 1;
      acc[company].contracts.push(award);
      
      // Group by year
      const year = new Date(award.date).getFullYear().toString();
      if (!acc[company].yearlyContracts[year]) {
        acc[company].yearlyContracts[year] = [];
      }
      acc[company].yearlyContracts[year].push(award);
      
      const currentDate = new Date(award.date);
      const latestDate = new Date(acc[company].latestContract.date);
      
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

  const toggleYearExpansion = (company: string, year: string) => {
    setExpandedYears(prev => ({
      ...prev,
      [company]: {
        ...(prev[company] || {}),
        [year]: !(prev[company] && prev[company][year])
      }
    }));
  };

  // Implement infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && visibleCompanies < companyData.length) {
          setVisibleCompanies(prev => Math.min(prev + 5, companyData.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [visibleCompanies, companyData.length]);

  if (!awards || awards.length === 0 || companyData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Contract Data Available</h3>
        <p className="text-gray-600 mb-4">
          No contract data is currently available. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companyData.slice(0, visibleCompanies).map(([company, data]) => (
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
          
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Contracts by Year</h4>
            <div className="space-y-2">
              {Object.entries(data.yearlyContracts)
                .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                .map(([year, yearContracts]) => (
                  <div key={`${company}-${year}`} className="border rounded-md">
                    <button 
                      onClick={() => toggleYearExpansion(company, year)}
                      className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{year}</span>
                        <span className="text-sm text-gray-500">
                          ({yearContracts.length} contract{yearContracts.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {expandedYears[company]?.[year] ? '−' : '+'}
                      </span>
                    </button>
                    
                    {expandedYears[company]?.[year] && (
                      <div className="p-3 border-t bg-gray-50">
                        <ul className="space-y-2">
                          {yearContracts.map((contract) => (
                            <li key={contract.id} className="text-sm">
                              <div className="font-medium">{new Date(contract.date).toLocaleDateString()}</div>
                              <div className="text-gray-600">{contract.description}</div>
                              <div className="text-gray-500 mt-1">
                                {formatCurrency(contract.amount)} • {contract.agency}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}

      {/* Loader for infinite scrolling */}
      {visibleCompanies < companyData.length && (
        <div ref={loaderRef} className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {selectedCompany && (
        <AnalysisSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          company={selectedCompany}
          companyData={{
            totalAmount: companyData.find(([company]) => company === selectedCompany)?.[1].totalAmount || 0,
            contractCount: companyData.find(([company]) => company === selectedCompany)?.[1].contractCount || 0,
            latestContract: companyData.find(([company]) => company === selectedCompany)?.[1].latestContract || awards[0],
            contracts: companyData.find(([company]) => company === selectedCompany)?.[1].contracts || []
          }}
        />
      )}
    </div>
  );
} 