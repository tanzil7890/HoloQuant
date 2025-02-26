import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome to GovSpend
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-12">
              Your comprehensive platform for tracking and analyzing government spending and contracts
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Government Spending Tracker</h2>
                <p className="text-gray-600 mb-6">
                  Track all government contract awards and spending across different agencies and recipients.
                </p>
                <a 
                  href="/govt-spending" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Explore Spending Data
                </a>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Public Company Monitor</h2>
                <p className="text-gray-600 mb-6">
                  Monitor government contracts awarded to publicly traded companies with detailed analytics.
                </p>
                <a 
                  href="/monitor-companies" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Monitor Companies
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
