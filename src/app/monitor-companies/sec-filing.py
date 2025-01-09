import requests
from datetime import datetime

def get_company_cik(company_name):
    headers = {
        'User-Agent': 'Your Name yourname@email.com'
    }
    
    formatted_name = company_name.upper().replace(' ', '+')
    search_url = f'https://www.sec.gov/files/company_tickers.json'
    
    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch company data: {response.status_code}")
    
    companies = response.json()
    
    for _, company_info in companies.items():
        if company_info['title'].upper() == company_name.upper():
            return str(company_info['cik_str']).zfill(10)
    
    raise Exception(f"Company '{company_name}' not found")

def get_filing_url(accession_number, cik):
    # Remove dashes from accession number
    clean_accession = accession_number.replace('-', '')
    
    # Construct the URL for the filing
    base_url = "https://www.sec.gov/Archives/edgar/data"
    filing_url = f"{base_url}/{cik}/{clean_accession}/{accession_number}.txt"
    
    return filing_url

def get_company_filings(company_name, form_type=None):
    try:
        cik = get_company_cik(company_name)
        
        headers = {
            'User-Agent': 'Your Name yourname@email.com'
        }
        
        url = f'https://data.sec.gov/submissions/CIK{cik}.json'
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch filing data: {response.status_code}")
        
        company_data = response.json()
        
        # Get recent filings
        filings = company_data.get('filings', {}).get('recent', {})
        if filings:
            filing_list = []
            forms = filings.get('form', [])
            dates = filings.get('filingDate', [])
            accession_numbers = filings.get('accessionNumber', [])
            
            for form, date, accession in zip(forms, dates, accession_numbers):
                if form_type is None or form == form_type:
                    filing_url = get_filing_url(accession, cik)
                    filing_list.append({
                        'form': form,
                        'date': date,
                        'url': filing_url,
                        'accession_number': accession
                    })
            
            return {
                'company_name': company_name,
                'cik': cik,
                'filings': filing_list
            }
        
        return None
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def display_filings(filing_data, limit=5):
    if not filing_data:
        print("No filing data available")
        return
    
    print(f"\nCompany Data for {filing_data['company_name']}:")
    print(f"CIK: {filing_data['cik']}")
    
    print("\nRecent Filings:")
    for i, filing in enumerate(filing_data['filings'][:limit], 1):
        print(f"\n{i}. Form {filing['form']}")
        print(f"   Filed on: {filing['date']}")
        print(f"   URL: {filing['url']}")
        print(f"   Accession Number: {filing['accession_number']}")

# Example usage
if __name__ == "__main__":
    company_name = 'LOCKHEED MARTIN CORP'
    
    # Get all filings
    print("Fetching all filings...")
    all_filings = get_company_filings(company_name)
    display_filings(all_filings)
    
    # Get specific form type (e.g., '10-K' for annual reports)
    print("\nFetching only 10-K filings...")
    form_10k_filings = get_company_filings(company_name, form_type='10-K')
    display_filings(form_10k_filings)
    
    # Example of how to select a specific filing
    if all_filings and all_filings['filings']:
        selected_filing = all_filings['filings'][0]  # Select the first filing
        print("\nSelected Filing Details:")
        print(f"Form: {selected_filing['form']}")
        print(f"Date: {selected_filing['date']}")
        print(f"URL: {selected_filing['url']}")