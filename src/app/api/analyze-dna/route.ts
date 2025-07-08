// app/api/analyze-dna/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockAnalyzeDNA } from '@/lib/dna-analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // In production, this would forward to your n8n webhook
    // For now, use mock analysis
    const result = await mockAnalyzeDNA(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('DNA analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}