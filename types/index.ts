export interface FormData {
    billingMetric: string;
    expectedConsumption: number;
    numberOfAssets: number;
    geography: string;
    utilizationRiskOffloading: number;
    acquisitionCostCore: number;
    acquisitionCostAccessories: number;
    projectCost: number;
    minimumUsageTerm: number;
    residualValueCore: number;
    residualValueAccessories: number;
    maintenanceFeeCore: number;
    maintenanceFeeAccessories: number;
    consumablesCost: number;
  }
  
  export interface CalculationResults {
    totalInvestmentCost: number;
    payPer: string;
    costPerUnit: number;
    totalUsageCostPerAsset: number;
    additionalCost: number;
    monthlyAdvancePaymentPerAsset: number;
    monthlyAdvancePaymentTotal: number;
  }