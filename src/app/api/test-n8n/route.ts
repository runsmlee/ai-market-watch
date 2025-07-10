import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const testQuery = {
      query: `Company: Test Startup
Description: AI-powered tool for testing
Category: AI Testing
Problem: Testing the n8n webhook
Solution: Verifying the API works
Target Market: Developers
Business Model: SaaS
Team Size: 1-5
Funding Stage: Pre-seed
Location: San Francisco
Year Founded: 2024`,
      timestamp: new Date().toISOString(),
      source: 'test'
    };

    const webhookUrl = 'https://n8n-qnj8.onrender.com/webhook/find_similar_startups';
    console.log('🧪 Testing n8n webhook:', webhookUrl);
    console.log('📤 Test request:', JSON.stringify(testQuery, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuery),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);

    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('✅ Parsed response:', JSON.stringify(jsonResponse, null, 2));
      return NextResponse.json({ 
        success: true, 
        response: jsonResponse,
        rawResponse: responseText 
      });
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse response',
        rawResponse: responseText 
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to test the n8n webhook',
    endpoint: 'https://n8n-qnj8.onrender.com/webhook/find_similar_startups'
  });
}