interface CompetitionAnalysisProps {
  isOpen: boolean;
  companyData: {
    contracts: Award[];
    totalAmount: number;
  };
  onToggle: () => void;
}

function CompetitionAnalysis({ isOpen, companyData, onToggle }: CompetitionAnalysisProps) {
  const competitionMetrics = {
    soleSource: companyData.contracts.filter(c => c.type === 'sole_source').length,
    competitive: companyData.contracts.filter(c => c.type === 'competitive').length,
    winRate: calculateWinRate(companyData.contracts),
    averageBidders: calculateAverageBidders(companyData.contracts)
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <button 
        onClick={onToggle}
        className="w-full p-4 flex justify-between items-center"
      >
        <h3 className="text-lg font-semibold">Competition Analysis</h3>
        {/* Add toggle icon */}
      </button>
      
      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              title="Competitive Wins"
              value={`${competitionMetrics.competitive}`}
            />
            <MetricCard 
              title="Sole Source"
              value={`${competitionMetrics.soleSource}`}
            />
            <MetricCard 
              title="Win Rate"
              value={`${competitionMetrics.winRate}%`}
            />
            <MetricCard 
              title="Avg. Competitors"
              value={competitionMetrics.averageBidders.toFixed(1)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 