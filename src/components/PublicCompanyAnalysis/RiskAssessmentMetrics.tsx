import { useMemo } from 'react';
import { Agency, AgencyHistory } from '../../app/api/spending_company';

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

interface Award {
  id: string;
  amount: number;
  date?: string;
  status: string;
  period_of_performance?: {
    start_date: string;
    end_date: string;
    potential_end_date?: string;
  };
  awarding_agency: {
    id: string;
    name: string;
  };
  description?: string;
  action_date?: string;
  award_date?: string;
}

export default function RiskAssessmentMetrics({ isOpen, companyData, onToggle }: RiskMetricsProps) {
  const metrics = useMemo(() => {
    // Calculate contract concentration with company size consideration
    const contractConcentration = companyData.totalRevenue && companyData.totalRevenue > 0
      ? (companyData.totalAmount / companyData.totalRevenue) * 100
      : Math.min((companyData.totalAmount / 1000000000) * 100, 100); // Use $1B as baseline

    // Calculate agency diversification with improved weighting
    const agencyConcentration = companyData.contracts.reduce((acc, contract) => {
      const agencyName = contract.awarding_agency?.name || 'Unknown Agency';
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

    // Update agency histories
    companyData.contracts.forEach(contract => {
      if (contract.awarding_agency?.id) {
        void updateAgencyHistory(contract);
      }
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
  // Weighted risk factors
  const concentrationWeight = 0.35;
  const agencyWeight = 0.35;
  const renewalWeight = 0.30;

  // Calculate individual risk scores
  const concentrationScore = Math.min(
    contractConcentration * (companyData.totalAmount > 1000000000 ? 0.8 : 1),
    100
  ) * concentrationWeight;

  // Agency concentration risk
  const uniqueAgencies = new Set(
    companyData.contracts
      .map(c => c.awarding_agency?.name)
      .filter(Boolean)
  ).size;
  
  const agencyScore = Math.min(
    topAgencyConcentration * (uniqueAgencies > 3 ? 0.7 : 1),
    100
  ) * agencyWeight;

  // Renewal risk with safe date handling
  const activeContracts = companyData.contracts.filter(contract => {
    if (!contract?.period_of_performance?.end_date) {
      return false;
    }
    try {
      const endDate = new Date(contract.period_of_performance.end_date);
      return !isNaN(endDate.getTime()) && endDate > new Date();
    } catch (error) {
      console.error('Error parsing contract end date:', error);
      return false;
    }
  });

  const renewalScore = totalContracts > 0 
    ? Math.min(
        ((nearTermRenewals / totalContracts) * 100) * 
        (activeContracts.length > 5 ? 0.8 : 1),
        100
      ) * renewalWeight
    : 0;

  return concentrationScore + agencyScore + renewalScore;
}

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

function calculateRenewalAnalysis(contracts: Award[]): RenewalAnalysis[] {
  const now = new Date();
  
  return contracts
    .filter(contract => {
      if (!contract.period_of_performance?.end_date) return false;
      
      const endDate = new Date(contract.period_of_performance.end_date);
      const potentialEndDate = contract.period_of_performance?.potential_end_date 
        ? new Date(contract.period_of_performance.potential_end_date)
        : endDate;
      
      const isActive = 
        potentialEndDate > now ||
        endDate > now ||
        endDate > new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      
      return isActive && contract.amount > 0;
    })
    .map(contract => {
      const endDate = new Date(contract.period_of_performance!.end_date);
      const potentialEndDate = contract.period_of_performance?.potential_end_date 
        ? new Date(contract.period_of_performance.potential_end_date)
        : endDate;
      
      const monthsUntilRenewal = Math.max(
        0,
        Math.ceil(
          (potentialEndDate.getTime() - now.getTime()) / 
          (30 * 24 * 60 * 60 * 1000)
        )
      );

      const agencyRisk = determineAgencyRisk(contract);

      return {
        contractId: contract.id,
        endDate: potentialEndDate,
        amount: contract.amount,
        monthsUntilRenewal,
        riskFactors: {
          timeUntilExpiry: monthsUntilRenewal <= 3 ? 'HIGH' : 
                          monthsUntilRenewal <= 6 ? 'MEDIUM' : 'LOW',
          contractSize: contract.amount >= 1000000000 ? 'HIGH' :
                       contract.amount >= 100000000 ? 'MEDIUM' : 'LOW',
          agencyHistory: agencyRisk
        }
      };
    });
}

function determineAgencyRisk(contract: Award): 'HIGH' | 'MEDIUM' | 'LOW' {
  const agency = contract.awarding_agency as Agency;
  if (!agency) return 'HIGH';

  // Check if it's a defense agency
  const isDefenseAgency = 
    agency.name.toLowerCase().includes('defense') || 
    agency.name.toLowerCase().includes('dod') ||
    agency.subtier_agency?.name?.toLowerCase().includes('defense') || 
    false;

  if (isDefenseAgency) {
    return 'LOW';
  }

  // Consider established agencies as medium risk
  if (agency.subtier_agency?.id) {
    return 'MEDIUM';
  }
  
  return 'HIGH';
}

async function updateAgencyHistory(contract: Award): Promise<void> {
  if (!contract.awarding_agency?.id) return;
  
  try {
    const history = await fetchAgencyHistory(contract.awarding_agency.id);
    if (!history) return;
    
    const riskLevel = analyzeAgencyHistory(history);
    // Here you could update a state or context with the new risk level
    console.log(`Updated agency history risk level for ${contract.id}: ${riskLevel}`);
  } catch (error) {
    console.error('Error updating agency history:', error);
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

// Add this function to fetch historical agency data
async function fetchAgencyHistory(agencyId: string): Promise<AgencyHistory | null> {
  try {
    const response = await fetch(`/api/v2/agency/${agencyId}/awards/`);
    const data = await response.json();
    return {
      new_award_count: data.new_award_count || 0,
      total_obligations: data.total_obligations || 0,
      last_updated: data.last_updated || new Date().toISOString(),
      agency_id: agencyId
    };
  } catch (error) {
    console.error('Error fetching agency history:', error);
    return null;
  }
}

// Add the analyzeAgencyHistory function
function analyzeAgencyHistory(history: AgencyHistory): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (!history) return 'HIGH';
  
  try {
    const { new_award_count = 0, total_obligations = 0 } = history;
    
    // Risk assessment based on award count and obligations
    if (new_award_count > 100 && total_obligations > 1000000000) {
      return 'LOW'; // High activity, established relationship
    } else if (new_award_count > 50 || total_obligations > 500000000) {
      return 'MEDIUM';
    }
    return 'HIGH'; // Low activity, higher risk
  } catch (error) {
    console.error('Error analyzing agency history:', error);
    return 'HIGH';
  }
}

function calculateHistoricalPerformance(contracts: Award[]): ContractHistory {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  // Filter contracts and ensure they have valid dates
  const recentContracts = contracts.filter(contract => {
    const contractDate = contract.date || 
                        contract.period_of_performance?.start_date || 
                        contract.action_date ||
                        contract.award_date;
    if (!contractDate) return false;
    
    const date = new Date(contractDate);
    return !isNaN(date.getTime());
  });
  
  // Group contracts by quarter
  const quarterlyData = recentContracts.reduce((acc, contract) => {
    const contractDate = new Date(
      contract.date || 
      contract.period_of_performance?.start_date || 
      contract.action_date ||
      contract.award_date || 
      new Date()
    );
    
    const quarter = `${contractDate.getFullYear()}-Q${Math.floor(contractDate.getMonth() / 3) + 1}`;
    
    if (!acc[quarter]) {
      acc[quarter] = {
        total: 0,
        won: 0,
        value: 0
      };
    }
    
    acc[quarter].total++;
    // Consider a contract won if it has an amount or is active/completed
    const isWon = contract.amount > 0 || 
                  contract.status === 'active' || 
                  contract.status === 'completed' ||
                  contract.status === 'awarded';
    
    if (isWon) {
      acc[quarter].won++;
      acc[quarter].value += contract.amount || 0;
    }
    
    return acc;
  }, {} as Record<string, { total: number; won: number; value: number; }>);

  // Calculate overall metrics
  const totalBids = recentContracts.length;
  const wonBids = recentContracts.filter(c => 
    c.amount > 0 || 
    c.status === 'active' || 
    c.status === 'completed' ||
    c.status === 'awarded'
  ).length;
  
  const totalValue = recentContracts.reduce((sum, c) => sum + (c.amount || 0), 0);

  // Calculate rates with proper handling of edge cases
  const winRate = totalBids > 0 ? (wonBids / totalBids) * 100 : 0;
  const averageContractValue = wonBids > 0 ? totalValue / wonBids : 0;

  // Sort trends chronologically
  const trends = Object.entries(quarterlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([period, data]) => ({
      period,
      winRate: data.total > 0 ? (data.won / data.total) * 100 : 0,
      contractCount: data.total,
      totalValue: data.value
    }));

  return {
    totalBids,
    wonBids,
    winRate,
    averageContractValue,
    recentTrends: trends
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
