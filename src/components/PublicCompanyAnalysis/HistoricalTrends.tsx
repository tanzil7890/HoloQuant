import { useMemo } from 'react';
import { Award } from '../../app/api/spending_company';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalTrendsProps {
  isOpen: boolean;
  companyData: {
    contracts: Award[];
    totalAmount: number;
  };
  onToggle: () => void;
}

interface TrendData {
  period: string;
  amount: number;
  count: number;
  averageSize: number;
}

export default function HistoricalTrends({ isOpen, companyData, onToggle }: HistoricalTrendsProps) {
  const trendData = useMemo(() => {
    const periods = new Map<string, TrendData>();
    
    // Sort contracts by date
    const sortedContracts = [...companyData.contracts].sort((a, b) => {
      const dateA = new Date(a.date || a.action_date || a.award_date || '');
      const dateB = new Date(b.date || b.action_date || b.award_date || '');
      return dateA.getTime() - dateB.getTime();
    });

    // Group by quarters
    sortedContracts.forEach(contract => {
      const date = new Date(contract.date || contract.action_date || contract.award_date || '');
      if (isNaN(date.getTime())) return;

      const quarter = `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
      
      if (!periods.has(quarter)) {
        periods.set(quarter, {
          period: quarter,
          amount: 0,
          count: 0,
          averageSize: 0
        });
      }

      const data = periods.get(quarter)!;
      data.amount += contract.amount;
      data.count += 1;
      data.averageSize = data.amount / data.count;
    });

    return Array.from(periods.values());
  }, [companyData.contracts]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(1)}K`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
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
          <span className="text-sm font-semibold text-gray-800">Historical Trends</span>
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

      {isOpen && (
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="p-4 border-t border-gray-100">
            {trendData.length > 0 ? (
              <>
                <div className="h-64 mb-6 sticky top-0 bg-white pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                        interval={1}
                      />
                      <YAxis 
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#2563eb" 
                        name="Contract Value"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="averageSize" 
                        stroke="#16a34a" 
                        name="Average Size"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {trendData.slice(-3).map((period) => (
                    <div key={period.period} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">{period.period}</div>
                      <div className="text-lg font-semibold mt-1 text-gray-800">
                        {formatCurrency(period.amount)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {period.count} contracts
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No historical trend data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

        