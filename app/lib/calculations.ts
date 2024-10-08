import { FormData, CalculationResults } from '../../types';

// Configuration parameters
const MARKET_INTEREST_RATE = 4.80 / 100;  // 4.80% as a decimal
const MARGIN_EXPECTATION = 1.50 / 100;    // 1.50% as a decimal
const UTILIZATION_RISK_UPLIFT_FACTOR = 0.5;  // Utilization risk uplift factor (0.5 as a factor)
const UPLIFT_ON_CONSUMABLES = 2.00 / 100; // 2.00% as a decimal

// PMT function implementation
function PMT(rate: number, nper: number, pv: number, fv: number, type: number = 0): number {
    if (rate === 0) return -(pv + fv) / nper;
    const pvif = Math.pow(1 + rate, nper);
    let pmt = rate / (pvif - 1) * -(pv * pvif + fv);
    if (type === 1) {
      pmt /= (1 + rate);
    }
    return pmt;
}

// Updated PV function to ensure resale values are positive
function PV(rate: number, nper: number, pmt: number, fv: number, type: number = 0): number {
    if (rate === 0) return (fv + pmt * nper);  // Adjust to positive
    const pvif = Math.pow(1 + rate, nper);
    let pv = (fv + pmt * (1 - pvif)) / pvif;
    if (type === 1) {
      pv /= (1 + rate);
    }
    return pv;  // Return positive PV
}

// Return the pricing calculation
export function calculatePricing(data: FormData): CalculationResults {

  // Log all the parameters received
  console.log("Received Parameters:");
  console.log("acquisitionCostCore:", data.acquisitionCostCore);
  console.log("acquisitionCostAccessories:", data.acquisitionCostAccessories);
  console.log("projectCost:", data.projectCost);
  console.log("residualValueCore:", data.residualValueCore);
  console.log("residualValueAccessories:", data.residualValueAccessories);
  console.log("minimumUsageTerm:", data.minimumUsageTerm);
  console.log("maintenanceFeeCore:", data.maintenanceFeeCore);
  console.log("maintenanceFeeAccessories:", data.maintenanceFeeAccessories);
  console.log("consumablesCost:", data.consumablesCost);
  console.log("numberOfAssets:", data.numberOfAssets);
  console.log("expectedConsumption:", data.expectedConsumption);
  console.log("utilizationRiskOffloading:", data.utilizationRiskOffloading);
  console.log("billingMetric:", data.billingMetric);

  // Calculate CORE_ASSETS_RELATIVE
  const CORE_ASSETS_RELATIVE = PMT(
    MARKET_INTEREST_RATE,
    data.minimumUsageTerm / 12,  // Convert months to years
    -(1 + (data.minimumUsageTerm / 12 * MARGIN_EXPECTATION)),
    data.residualValueCore / 100,
    0
  );
  console.log("CORE_ASSETS_RELATIVE:", CORE_ASSETS_RELATIVE);

  // Calculate CORE_ASSETS_ABSOLUTE
  const CORE_ASSETS_ABSOLUTE = CORE_ASSETS_RELATIVE * (data.acquisitionCostCore / data.numberOfAssets);
  console.log("CORE_ASSETS_ABSOLUTE:", CORE_ASSETS_ABSOLUTE);

  // Calculate ACCESSORIES_RELATIVE
  const ACCESSORIES_RELATIVE = PMT(
    MARKET_INTEREST_RATE,
    data.minimumUsageTerm / 12,
    -(1 + (data.minimumUsageTerm / 12 * MARGIN_EXPECTATION)),
    data.residualValueAccessories / 100,
    0
  );
  console.log("ACCESSORIES_RELATIVE:", ACCESSORIES_RELATIVE);

  // Calculate ACCESSORIES_ABSOLUTE
  const ACCESSORIES_ABSOLUTE = ACCESSORIES_RELATIVE * (data.acquisitionCostAccessories / data.numberOfAssets);
  console.log("ACCESSORIES_ABSOLUTE:", ACCESSORIES_ABSOLUTE);

  // Calculate PROJECT_COST_RELATIVE
  const PROJECT_COST_RELATIVE = PMT(
    MARKET_INTEREST_RATE,
    data.minimumUsageTerm / 12,
    -(1 + (data.minimumUsageTerm / 12 * MARGIN_EXPECTATION)),
    0,  // No residual value for project cost
    0
  );
  console.log("PROJECT_COST_RELATIVE:", PROJECT_COST_RELATIVE);

  // Calculate PROJECT_COST_ABSOLUTE
  const PROJECT_COST_ABSOLUTE = PROJECT_COST_RELATIVE * (data.projectCost / data.numberOfAssets);
  console.log("PROJECT_COST_ABSOLUTE:", PROJECT_COST_ABSOLUTE);

  // Calculate OPERATING_COST_ABSOLUTE per asset
  const OPERATING_COST_ABSOLUTE = (data.maintenanceFeeCore + data.maintenanceFeeAccessories + data.consumablesCost) / data.numberOfAssets;
  console.log("OPERATING_COST_ABSOLUTE:", OPERATING_COST_ABSOLUTE);

  // Calculate SUBTOTAL_COST_ABSOLUTE
  const SUBTOTAL_COST_ABSOLUTE = CORE_ASSETS_ABSOLUTE + ACCESSORIES_ABSOLUTE + PROJECT_COST_ABSOLUTE + OPERATING_COST_ABSOLUTE;
  console.log("SUBTOTAL_COST_ABSOLUTE:", SUBTOTAL_COST_ABSOLUTE);

  // Log intermediate results to debug
  console.log("SUBTOTAL_COST_ABSOLUTE:", SUBTOTAL_COST_ABSOLUTE);
  console.log("expectedConsumption:", data.expectedConsumption);
  console.log("utilizationRiskOffloading (converted to decimal):", data.utilizationRiskOffloading / 100);
  console.log("UTILIZATION_RISK_UPLIFT_FACTOR (no conversion, used as 0.5):", UTILIZATION_RISK_UPLIFT_FACTOR);
  console.log("consumablesCost:", data.consumablesCost);
  console.log("UPLIFT_ON_CONSUMABLES:", UPLIFT_ON_CONSUMABLES);

  // Calculate TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT
  const TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT = Math.ceil(
    ((SUBTOTAL_COST_ABSOLUTE / data.expectedConsumption) *
    (1 + (data.utilizationRiskOffloading / 100 * UTILIZATION_RISK_UPLIFT_FACTOR)) +  // Corrected to utilizationRiskOffloading
    (data.consumablesCost * (1 + UPLIFT_ON_CONSUMABLES))) * 100
  ) / 100;

  console.log("TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT:", TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT);

  // Calculate PV_CORE_ASSETS_RESALE_RELATIVE
  const PV_CORE_ASSETS_RESALE_RELATIVE = PV(
    MARKET_INTEREST_RATE * (data.minimumUsageTerm / 12),  // Rate adjusted for time
    1,  // Single period, as we're calculating resale after term
    0,  // No additional payments
    data.residualValueCore / 100,  // Future value of core assets (residual)
    0   // End of the period (standard)
  );
  console.log("PV_CORE_ASSETS_RESALE_RELATIVE:", PV_CORE_ASSETS_RESALE_RELATIVE);

  // Calculate PV_CORE_ASSETS_RESALE_ABSOLUTE
  const PV_CORE_ASSETS_RESALE_ABSOLUTE = PV_CORE_ASSETS_RESALE_RELATIVE * data.acquisitionCostCore;
  console.log("PV_CORE_ASSETS_RESALE_ABSOLUTE:", PV_CORE_ASSETS_RESALE_ABSOLUTE);

  // Calculate PV_ACCESSORIES_RESALE_RELATIVE
  const PV_ACCESSORIES_RESALE_RELATIVE = PV(
    MARKET_INTEREST_RATE * (data.minimumUsageTerm / 12),  // Rate adjusted for time
    1,  // Single period for resale calculation
    0,  // No additional payments
    data.residualValueAccessories / 100,  // Future value of accessories (residual)
    0   // End of the period
  );
  console.log("PV_ACCESSORIES_RESALE_RELATIVE:", PV_ACCESSORIES_RESALE_RELATIVE);

  // Calculate PV_ACCESSORIES_RESALE_ABSOLUTE
  const PV_ACCESSORIES_RESALE_ABSOLUTE = PV_ACCESSORIES_RESALE_RELATIVE * data.acquisitionCostAccessories;
  console.log("PV_ACCESSORIES_RESALE_ABSOLUTE:", PV_ACCESSORIES_RESALE_ABSOLUTE);

  // Calculate PV_USAGE_PAYMENTS_WORST_CASE_ABSOLUTE
  const PV_USAGE_PAYMENTS_WORST_CASE_ABSOLUTE = -PV(
    MARKET_INTEREST_RATE, 
    data.minimumUsageTerm, 
    (((TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT * data.expectedConsumption * (1 - data.utilizationRiskOffloading / 100)) / 12) * data.numberOfAssets) - 
    ((data.expectedConsumption / 12 * data.numberOfAssets * (1 - data.utilizationRiskOffloading / 100) * data.consumablesCost * (1 + UPLIFT_ON_CONSUMABLES))), 
    0, 
    1
  ) + PV(
    MARKET_INTEREST_RATE * (data.minimumUsageTerm / 12), 
    1, 
    ((TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT * data.expectedConsumption) - 
    (TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT * data.expectedConsumption * (1 - data.utilizationRiskOffloading / 100)) - 
    (data.expectedConsumption * data.numberOfAssets * data.utilizationRiskOffloading / 100 * data.consumablesCost * (1 + UPLIFT_ON_CONSUMABLES))),
    0, 
    0
  );

  console.log("PV_USAGE_PAYMENTS_WORST_CASE_ABSOLUTE:", PV_USAGE_PAYMENTS_WORST_CASE_ABSOLUTE);

  return {
    totalInvestmentCost: data.acquisitionCostCore + data.acquisitionCostAccessories + data.projectCost,
    payPer: data.billingMetric,
    costPerUnit: TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT,  
    totalUsageCostPerAsset: TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT * data.expectedConsumption,
    additionalCost: TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT * data.expectedConsumption*(1-data.utilizationRiskOffloading/100),  
    monthlyAdvancePaymentPerAsset: TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT*data.expectedConsumption*(1-data.utilizationRiskOffloading/100)/12,
    monthlyAdvancePaymentTotal: (TOTAL_USAGE_COST_PER_ASSET_PER_METERED_UNIT*data.expectedConsumption*(1-data.utilizationRiskOffloading/100)/12)*data.numberOfAssets,
    //PV_CORE_ASSETS_RESALE_ABSOLUTE,
    //PV_ACCESSORIES_RESALE_ABSOLUTE,
    //PV_USAGE_PAYMENTS_WORST_CASE_ABSOLUTE
  };
}
