function GeographicAnalysis({ isOpen, companyData, onToggle }) {
  const stateDistribution = analyzeStateDistribution(companyData.contracts);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Geographic Distribution</h3>
      </button>
      
      {isOpen && (
        <div className="p-4">
          <div className="h-64">
            <USMapChart data={stateDistribution} />
          </div>
          <div className="mt-4">
            <TopStatesList data={stateDistribution} />
          </div>
        </div>
      )}
    </div>
  );
} 