import { useMemo } from 'react';
import { Award } from '../../app/api/spending';

interface RiskMetricsProps {
  isOpen: boolean;
  companyData: {
    totalAmount: number;
    contractCount: number;
    contracts: Award[];
    totalRevenue?: number;
    latestContract: Award;
  };
  onToggle: () => void;
}

interface AgencyConcentration {
  agencyName: string;
  contractCount: number;
  totalValue: number;
  percentageOfTotal: number;
}

interface RenewalAnalysis {
  contractId: string;
  endDate: Date;
  amount: number;
  monthsUntilRenewal: number;
  historicalRenewalRate?: number;
  riskFactors: {
    timeUntilExpiry: RiskLevel;
    contractSize: RiskLevel;
    agencyHistory: RiskLevel;
  };
  previousRenewals?: {
    date: Date;
    amount: number;
    terms: number;
  }[];
}

interface ContractHistory {
  totalBids: number;
  wonBids: number;
  winRate: number;
  averageContractValue: number;
  recentTrends: {
    period: string;
    winRate: number;
    contractCount: number;
  }[];
}

export default function RiskAssessmentMetrics({ isOpen, companyData, onToggle }: RiskMetricsProps) {
  const metrics = useMemo(() => {
    // Calculate contract concentration with company size consideration
    const contractConcentration = companyData.totalRevenue && companyData.totalRevenue > 0
      ? (companyData.totalAmount / companyData.totalRevenue) * 100
      : Math.min((companyData.totalAmount / 1000000000) * 100, 100); // Use $1B as baseline

    // Calculate agency diversification with improved weighting
    const agencyConcentration = companyData.contracts.reduce((acc, contract) => {
      const agencyName = contract.agency || 'Unknown Agency';
      if (!acc[agencyName]) {
        acc[agencyName] = {
          agencyName,
          contractCount: 0,
          totalValue: 0,
          percentageOfTotal: 0
        };
      }
      
      acc[agencyName].contractCount += 1;
      acc[agencyName].totalValue += contract.amount || 0;
      return acc;
    }, {} as Record<string, AgencyConcentration>);

    // Calculate percentages with consideration for agency diversity
    const totalValue = companyData.totalAmount;
    Object.values(agencyConcentration).forEach(agency => {
      agency.percentageOfTotal = totalValue > 0 
        ? (agency.totalValue / totalValue) * 100 
        : 0;
    });

    const topAgencyByValue = Object.values(agencyConcentration)
      .sort((a, b) => b.percentageOfTotal - a.percentageOfTotal)[0];

    const contractRenewals = calculateRenewalAnalysis(companyData.contracts);
    const nearTermRenewals = contractRenewals.filter(
      renewal => renewal.monthsUntilRenewal <= 6
    ).length;

    const riskScore = calculateRiskScore({
      contractConcentration,
      topAgencyConcentration: topAgencyByValue?.percentageOfTotal || 0,
      nearTermRenewals,
      totalContracts: companyData.contractCount || 0,
      companyData
    });

    const historicalPerformance = calculateHistoricalPerformance(companyData.contracts);

    return {
      contractConcentration,
      agencyConcentration: Object.values(agencyConcentration),
      contractRenewals,
      topAgencyConcentration: topAgencyByValue?.percentageOfTotal || 0,
      riskScore,
      historicalPerformance
    };
  }, [companyData]);

  return (
    <div className="border rounded-lg overflow-hidden">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-800">Risk Assessment</span>
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
          isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
      >
        <div className="space-y-6 p-4">
          {/* Risk Score */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Overall Risk Score</h3>
              <span className={`text-lg font-bold ${
                metrics.riskScore > 70 ? 'text-red-600' :
                metrics.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {metrics.riskScore.toFixed(0)}
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Contract Concentration */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Contract Concentration</span>
                  <span className="font-medium text-gray-400">
                    {metrics.contractConcentration.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      metrics.contractConcentration > 30 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(metrics.contractConcentration, 100)}%` }}
                  />
                </div>
              </div>

              {/* Agency Diversification */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Top Agency Exposure</span>
                  <span className="font-medium text-gray-400">
                    {metrics.topAgencyConcentration.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      metrics.topAgencyConcentration > 50 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(metrics.topAgencyConcentration, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Historical Performance */}
          <HistoricalPerformance data={metrics.historicalPerformance} />

          {/* Contract Renewals */}
          <ContractRenewalTimeline renewals={metrics.contractRenewals} />
        </div>
      </div>
    </div>
  );
}
function calculateRiskScore({
  contractConcentration,
  topAgencyConcentration,
  nearTermRenewals,
  totalContracts,
  companyData
}: {
  contractConcentration: number;
  topAgencyConcentration: number;
  nearTermRenewals: number;
  totalContracts: number;
  companyData: {
    contracts: Award[];
    totalAmount: number;
  };
}): number {
  // Base risk score starts at 50 (medium risk)
  let riskScore = 50;
  
  // Contract concentration risk (higher concentration = higher risk)
  if (contractConcentration > 50) {
    riskScore += 15;
  } else if (contractConcentration > 30) {
    riskScore += 7;
  } else if (contractConcentration < 10) {
    riskScore -= 10;
  }
  
  // Agency concentration risk
  if (topAgencyConcentration > 70) {
    riskScore += 15;
  } else if (topAgencyConcentration > 50) {
    riskScore += 7;
  } else if (topAgencyConcentration < 30) {
    riskScore -= 10;
  }
  
  // Near-term renewal risk
  const renewalRiskFactor = totalContracts > 0 
    ? (nearTermRenewals / totalContracts) * 100 
    : 0;
    
  if (renewalRiskFactor > 50) {
    riskScore += 20;
  } else if (renewalRiskFactor > 25) {
    riskScore += 10;
  } else if (renewalRiskFactor < 10) {
    riskScore -= 5;
  }
  
  // Agency diversification
  const uniqueAgencies = new Set(
    companyData.contracts
      .map(c => c.agency)
      .filter(Boolean)
  ).size;
  
  if (uniqueAgencies >= 5) {
    riskScore -= 10;
  } else if (uniqueAgencies >= 3) {
    riskScore -= 5;
  } else if (uniqueAgencies <= 1) {
    riskScore += 10;
  }
  
  // Ensure risk score stays within 0-100 range
  return Math.max(0, Math.min(100, riskScore));
}

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

function calculateRenewalAnalysis(contracts: Award[]): RenewalAnalysis[] {
  const renewals: RenewalAnalysis[] = [];
  
  contracts.forEach(contract => {
    // Since we don't have period_of_performance in the new Award interface,
    // we'll use the contract date plus 1 year as an estimated end date
    const startDate = new Date(contract.date);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Assume 1-year contracts
    
    const today = new Date();
    const monthsUntilRenewal = Math.max(
      0,
      (endDate.getFullYear() - today.getFullYear()) * 12 +
        (endDate.getMonth() - today.getMonth())
    );
    
    const timeRisk: RiskLevel = 
      monthsUntilRenewal <= 3 ? 'HIGH' :
      monthsUntilRenewal <= 6 ? 'MEDIUM' : 'LOW';
    
    const sizeRisk: RiskLevel = 
      contract.amount > 1000000 ? 'HIGH' :
      contract.amount > 100000 ? 'MEDIUM' : 'LOW';
    
    const agencyRisk = determineAgencyRisk(contract);
    
    renewals.push({
      contractId: contract.id,
      endDate,
      amount: contract.amount,
      monthsUntilRenewal,
      riskFactors: {
        timeUntilExpiry: timeRisk,
        contractSize: sizeRisk,
        agencyHistory: agencyRisk
      }
    });
  });
  
  return renewals.sort((a, b) => a.monthsUntilRenewal - b.monthsUntilRenewal);
}

function determineAgencyRisk(contract: Award): RiskLevel {
  // Simplified agency risk determination based on agency name
  const agencyName = contract.agency;
  
  // This is a simplified example - in a real app, you'd have more sophisticated logic
  if (agencyName.includes('Defense') || agencyName.includes('DOD')) {
    return 'LOW'; // Defense contracts tend to be more stable
  } else if (agencyName.includes('Health') || agencyName.includes('HHS')) {
    return 'MEDIUM';
  } else {
    return 'HIGH';
  }
}

function ContractRenewalTimeline({ renewals }: { renewals: RenewalAnalysis[] }) {
  const activeRenewals = renewals.filter(r => r.monthsUntilRenewal > 0);
  
  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Contract Renewal Timeline</h3>
        <span className="text-sm text-gray-500">
          {activeRenewals.length} active contracts
        </span>
      </div>

      {activeRenewals.length > 0 ? (
        <div className="space-y-3">
          {activeRenewals.map((renewal) => (
            <div key={renewal.contractId} 
                 className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium">
                    Renewal: {renewal.endDate.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(renewal.monthsUntilRenewal)} months remaining
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${(renewal.amount / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-gray-500">
                    Contract Value
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                {Object.entries(renewal.riskFactors).map(([key, value]) => (
                  <span
                    key={key}
                    className={`px-2 py-1 rounded-full text-xs ${
                      value === 'HIGH' ? 'bg-red-100 text-red-800' :
                      value === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">No active contracts requiring renewal</p>
          <p className="text-xs text-gray-400 mt-1">All contracts are either completed or expired</p>
        </div>
      )}
    </div>
    
  );
}

function calculateHistoricalPerformance(contracts: Award[]): ContractHistory {
  // Group contracts by year and month
  const contractsByMonth: Record<string, { count: number; value: number }> = {};
  
  contracts.forEach(contract => {
    const date = new Date(contract.date);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!contractsByMonth[yearMonth]) {
      contractsByMonth[yearMonth] = { count: 0, value: 0 };
    }
    
    contractsByMonth[yearMonth].count += 1;
    contractsByMonth[yearMonth].value += contract.amount;
  });
  
  // Calculate win rate trends (simulated data since we don't have bid information)
  const recentTrends = Object.entries(contractsByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([period, data]) => ({
      period,
      winRate: Math.min(Math.random() * 0.3 + 0.5, 1), // Simulated win rate between 50-80%
      contractCount: data.count
    }));
  
  return {
    totalBids: contracts.length * 1.5, // Simulated: assume they bid on 50% more contracts than won
    wonBids: contracts.length,
    winRate: contracts.length / (contracts.length * 1.5),
    averageContractValue: contracts.reduce((sum, c) => sum + c.amount, 0) / contracts.length,
    recentTrends
  };
}

function HistoricalPerformance({ data }: { data: ContractHistory }) {
  const hasData = data.totalBids > 0;
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Historical Performance</h3>
      
      {hasData ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-600 text-sm">Win Rate</span>
              <div className="text-2xl font-bold mt-1 text-gray-800">
                {data.winRate.toFixed(1)}%
              </div>
              <span className="text-xs text-gray-500">
                ({data.wonBids} of {data.totalBids} bids)
              </span>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Average Contract Value</span>
              <div className="text-2xl font-bold mt-1 text-gray-800">
                {formatCurrency(data.averageContractValue)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 sticky top-0 bg-white py-2">
              Quarterly Trends
            </h4>
            {data.recentTrends.length > 0 ? (
              <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {data.recentTrends.map(trend => (
                  <div 
                    key={trend.period} 
                    className="flex items-center justify-between py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-600">{trend.period}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center min-w-[100px]">
                        <span className="text-sm font-medium">{trend.winRate.toFixed(1)}%</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({trend.contractCount} bids)
                        </span>
                      </div>
                      <div 
                        className={`h-2 w-24 rounded-full ${
                          trend.winRate >= 70 ? 'bg-green-500' :
                          trend.winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ opacity: trend.winRate > 0 ? trend.winRate / 100 : 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No quarterly data available
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No historical performance data available</p>
        </div>
      )}
    </div>
  );
}
