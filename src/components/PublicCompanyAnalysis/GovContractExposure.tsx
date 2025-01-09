import { Award } from '../../app/api/spending_company';

interface GovContractExposureProps {
  isOpen: boolean;
  company: string;
  companyData: {
    totalAmount: number;
    contractCount: number;
    contracts: Award[];
  };
  onViewMoreClick: () => void;
  onToggle: () => void;
}

export default function GovContractExposure({ 
  isOpen, 
  company, 
  companyData, 
  onViewMoreClick,
  onToggle 
}: GovContractExposureProps) {
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          <span className="text-sm font-semibold text-gray-800 text-left">
            Company&apos;s Overall Government Contract Exposure
          </span>
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
          isOpen ? 'max-h-[300px]' : 'max-h-0'
        } overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{company}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg">
                <p className="text-sm text-gray-600">Total Contract Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact',
                  }).format(companyData.totalAmount)}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <p className="text-sm text-gray-600">Contract Count</p>
                <p className="text-2xl font-bold text-blue-600">
                  {companyData.contractCount}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-semibold text-gray-800">Contract History</h4>
              {companyData.contracts.length > 5 && (
                <button
                  onClick={onViewMoreClick}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <span>View all contracts</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="space-y-3">
              {companyData.contracts.slice(0, 5).map((contract) => (
                <div key={contract.id} className="border-b pb-2">
                  <p className="text-sm text-gray-600">
                    {new Date(contract.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">
                    {contract.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
