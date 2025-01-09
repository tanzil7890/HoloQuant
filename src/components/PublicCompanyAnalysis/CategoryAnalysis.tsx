function CategoryAnalysis({ isOpen, companyData, onToggle }) {
  const categories = analyzePSCCategories(companyData.contracts);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contract Categories</h3>
      </button>
      
      {isOpen && (
        <div className="p-4">
          <TreemapChart data={categories} />
          <div className="mt-4">
            <CategoryBreakdown data={categories} />
          </div>
        </div>
      )}
    </div>
  );
} 