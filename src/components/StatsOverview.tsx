import { Award } from '../app/api/spending';

interface StatsOverviewProps {
  awards: Award[];
}

export default function StatsOverview({ awards }: StatsOverviewProps) {
  const totalSpending = awards.reduce((sum, award) => sum + award.amount, 0);
  const averageAward = totalSpending / awards.length;
  const uniqueAgencies = new Set(awards.map(award => award.agency)).size;

  return (
    
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-500 text-sm font-medium">Total Contract Value</h3>
        <p className="text-3xl font-bold text-blue-600">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
          }).format(totalSpending)}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-500 text-sm font-medium">Average Award Size</h3>
        <p className="text-3xl font-bold text-blue-600">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
          }).format(averageAward)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-500 text-sm font-medium">Awarding Agencies</h3>
        <p className="text-3xl font-bold text-blue-600">{uniqueAgencies}</p>
      </div>
    </div>
  );
} 