export interface Award {
  id: string;
  amount: number;
  date: string;
  agency: string;
  recipient: string;
  description: string;
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
      throw new Error(`Failed to fetch spending data: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data.results.map((item) => ({
      id: item.generated_internal_id,
      amount: item['Award Amount'],
      date: item['Start Date'],
      agency: item['Awarding Agency'],
      recipient: item['Recipient Name'] || 'Unknown Recipient',
      description: item.Description
    }));
  } catch (error) {
    console.error('Error fetching spending data:', error);
    return [];
  }
} 