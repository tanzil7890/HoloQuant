export interface Agency {
  id: string;
  name: string;
  type: string;
  subtier_agency?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface AgencyHistory {
  new_award_count: number;
  total_obligations: number;
  last_updated: string;
  fiscal_year?: number;
  agency_id: string;
}

export interface Award {
  id: string;
  amount: number;
  date?: string;
  action_date?: string;
  award_date?: string;
  type: string;
  status: string;
  recipient_id: string;
  recipient_name: string;
  period_of_performance: {
    start_date: string;
    end_date: string;
    potential_end_date?: string;
  };
  awarding_agency: Agency;
  description?: string;
  contract_data?: {
    contract_type: string;
    extent_competed: string;
  };
}

interface ApiResponse {
  results: {
    'Award ID': string;
    'Award Amount': number;
    'Start Date': string;
    'Awarding Agency': string;
    'Recipient Name': string;
    Description: string;
    generated_internal_id: string;
  }[];
  page_metadata: {
    page: number;
    hasNext: boolean;
    last_record_unique_id: number | null;
    last_record_sort_value: string;
  };
}

const BASE_URL = 'https://api.usaspending.gov/api/v2';

export async function getSpendingData(): Promise<Award[]> {
  try {
    const currentDate = new Date();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(currentDate.getFullYear() - 10);

    const response = await fetch(`${BASE_URL}/search/spending_by_award/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          time_period: [
            {
              start_date: tenYearsAgo.toISOString().split('T')[0],
              end_date: currentDate.toISOString().split('T')[0]
            }
          ],
          award_type_codes: ["A", "B", "C", "D"],
          award_amounts: [
            {
              lower_bound: 0,
              upper_bound: 1000000000000
            }
          ]
        },
        fields: [
          "Award ID",
          "Award Amount",
          "Start Date",
          "Awarding Agency",
          "Recipient Name",
          "Description",
          "generated_internal_id"
        ],
        page: 1,
        limit: 100,
        sort: "Start Date",
        order: "desc"
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Failed to fetch spending data: ${response.status}`);
      return [];
    }

    const data: ApiResponse = await response.json();
    
    return data.results.map(result => ({
      id: result.generated_internal_id,
      amount: result['Award Amount'],
      date: result['Start Date'],
      awarding_agency: {
        id: '0',
        name: result['Awarding Agency'],
        type: 'agency'
      },
      period_of_performance: {
        start_date: result['Start Date'],
        end_date: result['Start Date']
      },
      type: 'contract',
      status: 'active',
      recipient_id: result['Recipient Name'],
      recipient_name: result['Recipient Name'],
      description: result.Description
    }));

  } catch (error) {
    console.error('Error fetching spending data:', error);
    return [];
  }
} 