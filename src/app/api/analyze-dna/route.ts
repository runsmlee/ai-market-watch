// app/api/analyze-dna/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface N8NAPIResponse {
  output: {
    query_summary: string;
    matches: Array<{
      id: string;
      company_name: string;
      category: string;
      similarity_score: number;
      description: string;
      why_similar: string;
      funding_stage: string;
      total_funding: string;
      year_founded: number;
      location: string;
      key_differentiators: string[];
    }>;
    insights: {
      common_patterns: string[];
      market_opportunities: string[];
      potential_competitors: string[];
      potential_partners: string[];
      strategic_recommendations: string[];
    };
    metadata: {
      total_results: number;
      reranked_results: number;
      search_timestamp: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Prepare the request body
    const requestBody = {
      query: `Company: ${formData.companyName}
Description: ${formData.description}
Category: ${formData.category}
Problem: ${formData.problem}
Solution: ${formData.solution}
Target Market: ${formData.targetMarket}
Business Model: ${formData.businessModel}
Team Size: ${formData.teamSize}
Funding Stage: ${formData.fundingStage}
Location: ${formData.location}
Year Founded: ${formData.yearFounded}`,
      timestamp: new Date().toISOString(),
      source: 'web-app'
    };

    // Call n8n webhook with timeout
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-qnj8.onrender.com/webhook/find_similar_startups';
    console.log('Calling n8n webhook:', webhookUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('Raw n8n response:', responseText);
    
    let apiResponse: N8NAPIResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse n8n response:', parseError);
      throw new Error('Invalid JSON response from analysis service');
    }

    console.log('Parsed n8n response:', JSON.stringify(apiResponse, null, 2));
    
    // The response is not an array, it's a direct object with output property
    const n8nData = apiResponse.output;

    if (!n8nData) {
      console.error('No output in n8n response:', apiResponse);
      throw new Error('Invalid response structure from analysis service');
    }

    // Transform the response to our internal format
    const result = {
      userStartup: {
        id: `user-${Date.now()}`,
        embedding: Array(1536).fill(0).map(() => Math.random()),
      },
      matches: n8nData.matches.map(match => ({
        id: match.id,
        companyName: match.company_name,
        similarity: match.similarity_score,
        category: match.category,
        description: match.description,
        fundingRaised: match.total_funding,
        yearFounded: match.year_founded,
        whySimilar: match.why_similar,
        keyDifferentiators: match.key_differentiators,
      })),
      insights: {
        commonPatterns: n8nData.insights.common_patterns,
        differentiators: [],
        opportunities: n8nData.insights.market_opportunities,
        recommendations: n8nData.insights.strategic_recommendations,
      },
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('DNA analysis error:', error);
    
    let errorMessage = 'Analysis failed';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout';
        errorDetails = 'The analysis service took too long to respond. Please try again.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}