'use client';

import { useState, useEffect } from 'react'
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/app/components/ui/card"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { Separator } from "@/app/components/ui/separator" // Updated import statement

interface CalculatedData {
  totalAcquisitionCostPerAsset: number;
  operatingCostPerAsset: number;
}

interface Results {
  totalInvestmentCost: number;
  payPer: string;
  costPerUnit: number;
  totalUsageCostPerAsset: number;
  additionalCost: number;
  monthlyAdvancePaymentPerAsset: number;
  monthlyAdvancePaymentTotal: number;
}

export default function PricingCalculator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    billingMetric: 'kg',
    expectedConsumption: 960,
    numberOfAssets: 1000,
    geography: '',
    utilizationRiskOffloading: 50,
    acquisitionCostCore: 22000000,
    acquisitionCostAccessories: 6000000,
    projectCost: 9000000,
    minimumUsageTerm: 60,
    residualValueCore: 10,
    residualValueAccessories: 25,
    maintenanceFeeCore: 1100000,
    maintenanceFeeAccessories: 300000,
    consumablesCost: 10
  })

  const [calculatedData, setCalculatedData] = useState<CalculatedData>({
    totalAcquisitionCostPerAsset: 0,
    operatingCostPerAsset: 0
  })

  const [results, setResults] = useState<Results | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let parsedValue: string | number = value

    // Handle currency formatted inputs
    if (name.toLowerCase().includes('cost') || name.toLowerCase().includes('fee')) {
      // Remove currency symbol, spaces, and dots, then replace comma with dot for parsing
      parsedValue = parseFloat(value.replace(/[€\s.]/g, '').replace(',', '.')) || 0
    } else {
      parsedValue = parseFloat(value) || 0
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const totalAcquisitionCost = formData.acquisitionCostCore + formData.acquisitionCostAccessories + formData.projectCost
    const totalAcquisitionCostPerAsset = totalAcquisitionCost / formData.numberOfAssets
    const operatingCostPerAsset = (formData.maintenanceFeeCore + formData.maintenanceFeeAccessories) / formData.numberOfAssets

    setCalculatedData({
      totalAcquisitionCostPerAsset,
      operatingCostPerAsset
    })
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Calculation failed')
      }

      const results = await response.json()
      setResults(results)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '€ 0.00'; // Handle null case
    return `€ ${value.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground py-6">
          <CardTitle className="text-3xl font-bold text-center">RoxPay Pay-Per-Use Pricing Calculator</CardTitle>
        </CardHeader>
        
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-4">PPU Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="billingMetric" className="text-sm font-medium text-gray-700">Billing Metric</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'billingMetric')} defaultValue={formData.billingMetric}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select billing metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">hours</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="kWh">kWh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expectedConsumption" className="text-sm font-medium text-gray-700">Expected Consumption per Asset, p.a.</Label>
                    <Input type="number" id="expectedConsumption" name="expectedConsumption" value={formData.expectedConsumption} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="numberOfAssets" className="text-sm font-medium text-gray-700">Number of Core Assets</Label>
                    <Input type="number" id="numberOfAssets" name="numberOfAssets" value={formData.numberOfAssets} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="geography" className="text-sm font-medium text-gray-700">Geography</Label>
                    <Input type="text" id="geography" name="geography" value={formData.geography} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="utilizationRiskOffloading" className="text-sm font-medium text-gray-700">Utilization Risk Offloading (%)</Label>
                    <Input type="number" id="utilizationRiskOffloading" name="utilizationRiskOffloading" value={formData.utilizationRiskOffloading} onChange={handleInputChange} className="mt-1" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-semibold text-primary mb-4">Cost Structure - One-time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="acquisitionCostCore" className="text-sm font-medium text-gray-700">Net Acquisition Cost of Core Assets (€)</Label>
                    <Input type="text" id="acquisitionCostCore" name="acquisitionCostCore" value={formatCurrency(formData.acquisitionCostCore)} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="acquisitionCostAccessories" className="text-sm font-medium text-gray-700">Net Acquisition Cost of Accessories (€)</Label>
                    <Input type="text" id="acquisitionCostAccessories" name="acquisitionCostAccessories" value={formatCurrency(formData.acquisitionCostAccessories)} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="projectCost" className="text-sm font-medium text-gray-700">Project Cost (€)</Label>
                    <Input type="text" id="projectCost" name="projectCost" value={formatCurrency(formData.projectCost)} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="minimumUsageTerm" className="text-sm font-medium text-gray-700">Minimum Usage Term in Months</Label>
                    <Input type="number" id="minimumUsageTerm" name="minimumUsageTerm" value={formData.minimumUsageTerm} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="residualValueCore" className="text-sm font-medium text-gray-700">Expected Residual Value of Core Assets (%)</Label>
                    <Input type="number" id="residualValueCore" name="residualValueCore" value={formData.residualValueCore} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="residualValueAccessories" className="text-sm font-medium text-gray-700">Expected Residual Value of Accessories (%)</Label>
                    <Input type="number" id="residualValueAccessories" name="residualValueAccessories" value={formData.residualValueAccessories} onChange={handleInputChange} className="mt-1" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700">Total Acquisition Cost per Core Asset (€)</Label>
                  <Input type="text" value={formatCurrency(calculatedData.totalAcquisitionCostPerAsset)} readOnly className="mt-1 bg-gray-100" />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-semibold text-primary mb-4">Cost Structure - Recurring</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maintenanceFeeCore" className="text-sm font-medium text-gray-700">Maintenance Fee, Core Assets, p.a. (€)</Label>
                    <Input type="text" id="maintenanceFeeCore" name="maintenanceFeeCore" value={formatCurrency(formData.maintenanceFeeCore)} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="maintenanceFeeAccessories" className="text-sm font-medium text-gray-700">Maintenance Fee, Accessories, p.a. (€)</Label>
                    <Input type="text" id="maintenanceFeeAccessories" name="maintenanceFeeAccessories" value={formatCurrency(formData.maintenanceFeeAccessories)} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="consumablesCost" className="text-sm font-medium text-gray-700">Consumables Cost per Metered Unit (€)</Label>
                    <Input type="text" id="consumablesCost" name="consumablesCost" value={formatCurrency(formData.consumablesCost)} onChange={handleInputChange} className="mt-1" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700">Operating Cost per Asset, p.a. (€)</Label>
                  <Input type="text" value={formatCurrency(calculatedData.operatingCostPerAsset)} readOnly className="mt-1 bg-gray-100" />
                </div>
              </div>
            </div>

            {results && (
              <div className="mt-8 space-y-4 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-primary mb-4">Calculation Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Total Investment Cost</Label>
                    <Input type="text" value={formatCurrency(results.totalInvestmentCost)} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Pay-per-...</Label>
                    <Input type="text" value={results.payPer} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cost per Unit</Label>
                    <Input type="text" value={formatCurrency(results.costPerUnit)} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Total Usage Cost, per Asset, p.a.</Label>
                    <Input type="text" value={formatCurrency(results.totalUsageCostPerAsset)} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Additional Cost</Label>
                    <Input type="text" value={formatCurrency(results.additionalCost)} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Monthly Advance Payment, per Asset</Label>
                    <Input type="text" value={formatCurrency(results.monthlyAdvancePaymentPerAsset)} readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Monthly Advance Payment, Total</Label>
                    <Input type="text" value={formatCurrency(results.monthlyAdvancePaymentTotal)} readOnly className="mt-1 bg-gray-100" />
                  </div> 
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-100 px-6 py-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-md 
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'} 
                transition-colors duration-200`}
            >
              {loading ? 'Calculating...' : 'Calculate Pricing'}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}