import { Award } from '../../app/api/spending';
import { useMemo } from 'react';
import ContractDistributionChart from './ContractDistributionChart';

interface ContractValueAnalysisProps {
  isOpen: boolean;
  companyData: {
    totalAmount: number;
    contractCount: number;
    contracts: Award[];
  };
  onToggle: () => void;
}

interface ContractAnalysis {
  yearOverYearGrowth: number;
  averageContractSize: number;
  contractSizeDistribution: {
    small: number;
    medium: number;
    large: number;
  };
  monthlyTrends: {
    date: string;
    value: number;
  }[];
  yearlyTrends: YearlyTrend[];
  industryMetrics?: IndustryMetrics;
}

interface YearlyTrend {
  year: number;
  total: number;
  growth: number;
  contractCount: number;
}

interface IndustryMetrics {
  naicsCode: string;
  naicsDescription: string;
  averageContractSize: number;
  distribution: {
    small: number;
    medium: number;
    large: number;
  };
  totalContracts: number;
}

export default function ContractValueAnalysis({ 
  isOpen, 
  companyData,
  onToggle 
}: ContractValueAnalysisProps) {
  const contractAnalysis = useMemo(() => {
    const analysis: ContractAnalysis = {
      yearOverYearGrowth: 0,
      averageContractSize: 0,
      contractSizeDistribution: { small: 0, medium: 0, large: 0 },
      monthlyTrends: [],
      yearlyTrends: []
    };

    if (companyData.contracts.length === 0) return analysis;

    // Enhanced YoY growth calculation
    const calculateYoYGrowth = () => {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      
      // Group contracts by year and month
      const contractsByYearMonth = companyData.contracts.reduce((acc, contract) => {
        const date = new Date(contract.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const yearMonth = `${year}-${month}`;
        
        if (!acc[yearMonth]) {
          acc[yearMonth] = {
            total: 0,
            count: 0,
            year
          };
        }
        
        acc[yearMonth].total += contract.amount;
        acc[yearMonth].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number; year: number }>);

      // Calculate trailing 12-month totals
      const currentYearTotal = Object.values(contractsByYearMonth)
        .filter(data => data.year === currentYear)
        .reduce((sum, data) => sum + data.total, 0);

      const lastYearTotal = Object.values(contractsByYearMonth)
        .filter(data => data.year === lastYear)
        .reduce((sum, data) => sum + data.total, 0);

      if (lastYearTotal > 0) {
        return ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100;
      } else if (currentYearTotal > 0) {
        return 100; // New business
      }
      
      return null; // No data available
    };

    const yoyGrowth = calculateYoYGrowth();
    analysis.yearOverYearGrowth = yoyGrowth ?? 0;

    // Calculate average contract size
    analysis.averageContractSize = companyData.totalAmount / companyData.contractCount;

    // Calculate distribution
    companyData.contracts.forEach(contract => {
      if (contract.amount < 100000) analysis.contractSizeDistribution.small++;
      else if (contract.amount < 1000000) analysis.contractSizeDistribution.medium++;
      else analysis.contractSizeDistribution.large++;
    });

    // Calculate monthly trends
    const monthlyData = companyData.contracts.reduce((acc, contract) => {
      const date = new Date(contract.date).toISOString().slice(0, 7);
      acc[date] = (acc[date] || 0) + contract.amount;
      return acc;
    }, {} as Record<string, number>);

    analysis.monthlyTrends = Object.entries(monthlyData)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Enhanced YoY analysis with multi-year trends
    const calculateYearlyTrends = (): YearlyTrend[] => {
      const yearlyData: Record<number, { total: number; contractCount: number }> = {};
      
      // Group by year
      companyData.contracts.forEach(contract => {
        const year = new Date(contract.date).getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = { total: 0, contractCount: 0 };
        }
        yearlyData[year].total += contract.amount;
        yearlyData[year].contractCount += 1;
      });

      // Calculate trends with growth rates
      return Object.entries(yearlyData)
        .map(([year, data]) => {
          const numYear = parseInt(year);
          const prevYear = yearlyData[numYear - 1];
          const growth = prevYear 
            ? ((data.total - prevYear.total) / prevYear.total) * 100 
            : 0;

          return {
            year: numYear,
            total: data.total,
            growth,
            contractCount: data.contractCount
          };
        })
        .sort((a, b) => a.year - b.year);
    };

    const yearlyTrends = calculateYearlyTrends();
    const currentYearTrend = yearlyTrends[yearlyTrends.length - 1];
    analysis.yearOverYearGrowth = currentYearTrend?.growth ?? 0;
    analysis.yearlyTrends = yearlyTrends;
    
    return {
      ...analysis,
      yearlyTrends
    };
  }, [companyData]);

  // Helper function for YoY growth display
  const formatYoYGrowth = (growth: number) => {
    if (growth === null) return 'No historical data';
    if (growth === 0) return 'No change';
    const prefix = growth > 0 ? '+' : '';
    return `${prefix}${growth.toFixed(1)}%`;
  };

  return (
    <div className="border rounded-lg overflow-hidden ">
      {/* Dropdown Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg 
            className="w-5 h-5 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          <span className="text-sm font-semibold text-gray-800">Contract Value Analysis</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[400px]' : 'max-h-0'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
      >
        <div className="p-4 space-y-4">
          {/* Enhanced YoY Growth Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-600">Year-over-Year Growth</p>
                <p className={`text-2xl font-bold ${
                  contractAnalysis.yearOverYearGrowth > 0 
                    ? 'text-green-600' 
                    : contractAnalysis.yearOverYearGrowth < 0 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                }`}>
                  {formatYoYGrowth(contractAnalysis.yearOverYearGrowth)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Year Contracts</p>
                <p className="text-lg font-semibold text-blue-600">
                  {contractAnalysis.yearlyTrends[contractAnalysis.yearlyTrends.length - 1]?.contractCount || 0}
                </p>
              </div>
            </div>

            {/* Growth Trend Visualization */}
            <div className="mt-4">
              <div className="flex items-end space-x-1 h-24">
                {contractAnalysis.yearlyTrends.map((trend: YearlyTrend) => (
                  <div 
                    key={trend.year}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                    </div>
                    <div 
                      className={`w-full ${
                        trend.growth > 0 ? 'bg-green-400' : 'bg-red-400'
                      } rounded-t`}
                      style={{ 
                        height: `${Math.min(Math.abs(trend.growth), 100)}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {trend.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contract Size Distribution */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-gray-800">Contract Size Distribution</h4>
              {contractAnalysis.industryMetrics && (
                <span className="text-sm text-gray-500">
                  vs {contractAnalysis.industryMetrics.naicsDescription}
                </span>
              )}
            </div>
            <ContractDistributionChart
              companyDistribution={contractAnalysis.contractSizeDistribution}
              industryDistribution={contractAnalysis.industryMetrics?.distribution}
            />
          </div>

          {/* Monthly Trends */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Monthly Contract Values</h4>
            <div className="space-y-2">
              {contractAnalysis.monthlyTrends.slice(-6).map(({ date, value }) => (
                <div key={date} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact',
                    }).format(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
