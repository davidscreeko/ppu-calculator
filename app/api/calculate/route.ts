import { NextResponse } from 'next/server';
import { calculatePricing } from '@/app/lib/calculations';
import { FormData } from '@/types';

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();
    
    // Validate input data
    if (!formData.numberOfAssets || !formData.expectedConsumption) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const results = calculatePricing(formData);
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: 'Calculation failed' }, 
      { status: 500 }
    );
  }
}