import axios from "axios";

// Types for API responses
export interface AdverseEventReport {
  safetyreportid: string;
  receivedate: string;
  serious: string;
  seriousnessdeath?: string;
  seriousnesshospitalization?: string;
  seriousnesslifethreatening?: string;
  patient: {
    drug: Array<{
      drugcharacterization: string;
      medicinalproduct: string;
      drugadministrationroute?: string;
      drugindication?: string;
      actiondrug?: string;
      openfda?: {
        manufacturer_name?: string[];
        brand_name?: string[];
        generic_name?: string[];
        route?: string[];
        pharm_class_epc?: string[];
      };
    }>;
    reaction?: Array<{
      reactionmeddrapt: string;
      reactionoutcome: string;
    }>;
  };
}

export interface DrugInfo {
  submissions: Array<{
    submission_type: string;
    submission_number: string;
    submission_status: string;
    submission_status_date: string;
    submission_class_code?: string;
    submission_class_code_description?: string;
    review_priority?: string;
  }>;
  application_number: string;
  sponsor_name: string;
  products: Array<{
    product_number: string;
    reference_drug: string;
    brand_name: string;
    active_ingredients: Array<{
      name: string;
      strength: string;
    }>;
    reference_standard: string;
    dosage_form: string;
    route: string;
    marketing_status: string;
    te_code: string;
  }>;
}

export interface AdverseEventsResponse {
  meta: {
    results: {
      total: number;
      limit: number;
      skip: number;
    };
  };
  results: AdverseEventReport[];
}

export interface DrugInfoResponse {
  meta: {
    results: {
      total: number;
      limit: number;
      skip: number;
    };
  };
  results: DrugInfo[];
}

// Adverse Events API
export const fetchAdverseEvents = async (params: {
  drugName?: string;
  seriousness?: string[];
  limit?: number;
  skip?: number;
  receivedate?: string;
}): Promise<AdverseEventsResponse> => {
  const queryParams = new URLSearchParams();
  const searchParts: string[] = [];
  
  // Add drug name to search if provided
  if (params.drugName) {
    const searchTerm = params.drugName.trim();
    if (searchTerm) {
      searchParts.push(`patient.drug.medicinalproduct:"${searchTerm}"`);
    }
  }
  
  // Add seriousness filters to search
  if (params.seriousness?.includes('death')) {
    searchParts.push('seriousnessdeath:1');
  }
  
  if (params.seriousness?.includes('hospitalization')) {
    searchParts.push('seriousnesshospitalization:1');
  }
  
  if (params.seriousness?.includes('life-threatening')) {
    searchParts.push('seriousnesslifethreatening:1');
  }
  
  // Combine search parts if any
  if (searchParts.length > 0) {
    queryParams.append('search', searchParts.join('+AND+'));
  }
  
  // Add other query params
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  } else {
    queryParams.append('limit', '100'); // default if no limit provided
  }
  
  if (params.skip) {
    queryParams.append('skip', params.skip.toString());
  }
  
  if (params.receivedate) {
    queryParams.append('receivedate', params.receivedate);
  }

  try {
    const url = `https://api.fda.gov/drug/event.json?${queryParams.toString()}`;
    console.log('FDA API URL:', url);
    
    const response = await axios.get(url);
    console.log('FDA API Response:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('FDA API Error:', error);
    
    // Handle 404 and other errors gracefully
    if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
      console.log('Returning empty results for 404/400 error');
      // Return empty results instead of throwing error
      return {
        meta: {
          results: {
            total: 0,
            limit: 0,
            skip: 0,
          },
        },
        results: [],
      };
    }
    throw error; // Re-throw other errors
  }
};

// Drugs@FDA API
export const fetchDrugInfo = async (params: {
  drugName?: string;
  route?: string;
  limit?: number;
  skip?: number;
}): Promise<DrugInfoResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.drugName) {
    queryParams.append('search', `products.active_ingredients.name:"${params.drugName}"`);
  }
  
  if (params.route) {
    queryParams.append('search', `products.route:"${params.route}"`);
  }
  
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params.skip) {
    queryParams.append('skip', params.skip.toString());
  }

  try {
    const response = await axios.get(
      `https://api.fda.gov/drug/drugsfda.json?${queryParams.toString()}`
    );
    return response.data;
  } catch (error: unknown) {
    // Handle 404 and other errors gracefully
    if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
      // Return empty results instead of throwing error
      return {
        meta: {
          results: {
            total: 0,
            limit: 0,
            skip: 0,
          },
        },
        results: [],
      };
    }
    throw error; // Re-throw other errors
  }
};

// Utility function to get manufacturer data for a drug
export const getManufacturerData = (reports: AdverseEventReport[]) => {
  const manufacturerCounts: Record<string, number> = {};
  
  reports.forEach(report => {
    report.patient.drug.forEach(drug => {
      if (drug.openfda?.manufacturer_name) {
        drug.openfda.manufacturer_name.forEach(manufacturer => {
          manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
        });
      }
    });
  });
  
  return Object.entries(manufacturerCounts)
    .map(([manufacturer, count]) => ({ manufacturer, count }))
    .sort((a, b) => b.count - a.count);
};

// Utility function to get time series data
export const getTimeSeriesData = (reports: AdverseEventReport[]) => {
  const monthlyCounts: Record<string, number> = {};
  
  reports.forEach(report => {
    const date = new Date(report.receivedate);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
  });
  
  return Object.entries(monthlyCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};
