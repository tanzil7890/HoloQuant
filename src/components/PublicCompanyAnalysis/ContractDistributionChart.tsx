import { useMemo } from 'react';

interface ContractDistributionChartProps {
  companyDistribution: {
    small: number;
    medium: number;
    large: number;
  };
  industryDistribution?: {
    small: number;
    medium: number;
    large: number;
  };
}

export default function ContractDistributionChart({ 
  companyDistribution, 
  industryDistribution 
}: ContractDistributionChartProps) {
  const total = useMemo(() => 
    companyDistribution.small + companyDistribution.medium + companyDistribution.large,
    [companyDistribution]
  );

  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(companyDistribution).map(([size, count]) => (
          <div key={size} className="bg-blue-50 p-4 rounded-lg relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {size === 'small' ? '< $100k' : size === 'medium' ? '$100k-$1M' : '> $1M'}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {count}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {getPercentage(count)}%
            </div>
            
            {industryDistribution && (
              <div className="flex items-center space-x-2">
                <div className="h-1.5 bg-gray-200 flex-grow rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ 
                      width: `${getPercentage(industryDistribution[size as keyof typeof industryDistribution])}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Avg {getPercentage(industryDistribution[size as keyof typeof industryDistribution])}%
                </span>
              </div>
            )}
            
            <div className="absolute top-0 right-0 h-1 w-full rounded-t-lg" 
              style={{
                background: size === 'small' 
                  ? 'linear-gradient(90deg, #93C5FD, #60A5FA)' 
                  : size === 'medium'
                  ? 'linear-gradient(90deg, #60A5FA, #2563EB)'
                  : 'linear-gradient(90deg, #2563EB, #1E40AF)'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 