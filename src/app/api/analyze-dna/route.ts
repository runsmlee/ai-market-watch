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

    // Call n8n webhook with timeout and retry
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-qnj8.onrender.com/webhook/find_similar_startups';
    console.log('Calling n8n webhook:', webhookUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    let response: Response | null = null;
    let lastError: Error | null = null;
    const maxRetries = 2; // Try twice total
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        if (attempt > 1) {
          console.log(`Retry attempt ${attempt} after timeout...`);
        }
        
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        lastError = new Error(`Webhook failed: ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && error.name === 'AbortError' && attempt < maxRetries) {
          console.log(`Request timeout on attempt ${attempt}, will retry...`);
          continue; // Retry on timeout
        }
        throw error; // Throw other errors immediately
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error('Webhook failed after retries');
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
        errorDetails = 'The analysis service took too long to respond after multiple attempts. Please try again in a moment.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}