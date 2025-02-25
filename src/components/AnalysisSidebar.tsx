import { Award } from '../app/api/spending';
import { useState } from 'react';
import ContractValueAnalysis from './PublicCompanyAnalysis/ContractValueAnalysis';
import RiskAssessmentMetrics from './PublicCompanyAnalysis/RiskAssessmentMetrics';
import GovContractExposure from './PublicCompanyAnalysis/GovContractExposure';
import HistoricalTrends from '../components/PublicCompanyAnalysis/HistoricalTrends';
/* import AgencyRelationships from './PublicCompanyAnalysis/AgencyRelationships';
import CompetitionAnalysis from './PublicCompanyAnalysis/CompetitionAnalysis';
import GeographicAnalysis from './PublicCompanyAnalysis/GeographicAnalysis';
import CategoryAnalysis from './PublicCompanyAnalysis/CategoryAnalysis';
import PerformanceMetrics from './PublicCompanyAnalysis/PerformanceMetrics'; */


interface AnalysisSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  companyData: {
    totalAmount: number;
    contractCount: number;
    latestContract: Award;
    contracts: Award[];
  };
}

export default function AnalysisSidebar({ isOpen, onClose, company, companyData }: AnalysisSidebarProps) {
  const [isExposureOpen, setIsExposureOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isRiskOpen, setIsRiskOpen] = useState(false);
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false);
  /* const [isAgencyOpen, setIsAgencyOpen] = useState(false);
  const [isCompetitionOpen, setIsCompetitionOpen] = useState(false);
  const [isGeographicOpen, setIsGeographicOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false); */

  const handleViewMoreClick = () => {
    const searchParams = new URLSearchParams({
      company: encodeURIComponent(company),
      view: 'contracts'
    });
    window.open(`/company-contracts?${searchParams.toString()}`, '_blank');
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[32rem] bg-white shadow-lg transform transition-transform duration-300 ease-in-out  ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 bg-white z-20 p-6 pt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Our Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pt-24 pb-6 px-6 space-y-4">
        {/* Gov Contract Exposure */}
        <GovContractExposure
          isOpen={isExposureOpen}
          company={company}
          companyData={companyData}
          onViewMoreClick={handleViewMoreClick}
          onToggle={() => setIsExposureOpen(!isExposureOpen)}
        />

        {/* Contract Value Analysis */}
        <ContractValueAnalysis 
          isOpen={isAnalysisOpen}
          companyData={companyData}
          onToggle={() => setIsAnalysisOpen(!isAnalysisOpen)}
        />

        {/* Risk Assessment Metrics */}
        <RiskAssessmentMetrics 
          isOpen={isRiskOpen}
          companyData={companyData}
          onToggle={() => setIsRiskOpen(!isRiskOpen)}
        />

        {/* Historical Trends */}
        <HistoricalTrends 
          isOpen={isHistoricalOpen}
          companyData={companyData}
          onToggle={() => setIsHistoricalOpen(!isHistoricalOpen)}
        />

        {/* Agency Relationships */}
        {/* <AgencyRelationships 
          isOpen={isAgencyOpen}
          companyData={companyData}
          onToggle={() => setIsAgencyOpen(!isAgencyOpen)}
        />

        <CompetitionAnalysis 
          isOpen={isCompetitionOpen}
          companyData={companyData}
          onToggle={() => setIsCompetitionOpen(!isCompetitionOpen)}
        />
        
        <GeographicAnalysis 
          isOpen={isGeographicOpen}
          companyData={companyData}
          onToggle={() => setIsGeographicOpen(!isGeographicOpen)}
        />
        
        <CategoryAnalysis 
          isOpen={isCategoryOpen}
          companyData={companyData}
          onToggle={() => setIsCategoryOpen(!isCategoryOpen)}
        />
        
        <PerformanceMetrics 
          isOpen={isPerformanceOpen}
          companyData={companyData}
          onToggle={() => setIsPerformanceOpen(!isPerformanceOpen)}
        /> */}
      </div>
    </div>
  );
} 