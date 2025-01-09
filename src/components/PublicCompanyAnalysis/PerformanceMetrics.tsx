function PerformanceMetrics({ isOpen, companyData, onToggle }) {
  const metrics = calculatePerformanceMetrics(companyData.contracts);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
      </button>
      
      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              title="On-Time Delivery"
              value={`${metrics.onTimeDelivery}%`}
            />
            <MetricCard 
              title="Cost Performance"
              value={`${metrics.costPerformance}%`}
            />
            <MetricCard 
              title="Quality Rating"
              value={metrics.qualityRating}
            />
            <MetricCard 
              title="Past Performance"
              value={metrics.pastPerformance}
            />
          </div>
        </div>
      )}
    </div>
  );
} 