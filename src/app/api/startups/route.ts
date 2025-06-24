import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Google Apps Script URL - Check at runtime
    const APPS_SCRIPT_URL = process.env.APP_SCRIPT_URL;
    
    if (!APPS_SCRIPT_URL) {
      console.error('❌ APP_SCRIPT_URL environment variable is not set');
      return NextResponse.json(
        { 
          error: true, 
          message: 'APP_SCRIPT_URL environment variable is not set. Please check your .env.local file.',
          type: 'config_error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log('🚀 API Route called');
    console.log('📍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      APP_SCRIPT_URL: APPS_SCRIPT_URL ? 'SET' : 'NOT SET',
      URL_LENGTH: APPS_SCRIPT_URL?.length || 0
    });

    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to Apps Script
    const url = new URL(APPS_SCRIPT_URL);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log('🔄 Proxying request to Apps Script:', url.toString());

    // Create timeout signal (compatible with older Node.js versions)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout after 30 seconds');
      controller.abort();
    }, 30000); // 30 seconds

    console.log('📡 Starting fetch request...');
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AI-Market-Watch/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Apps Script error response:', errorText);
      throw new Error(`Apps Script responded with status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
    }

    console.log('🔄 Parsing JSON response...');
    const data = await response.json();
    
    console.log('✅ Successfully fetched and parsed data from Apps Script:', {
      dataType: typeof data,
      hasData: !!data.data,
      dataLength: Array.isArray(data.data) ? data.data.length : 'Not an array'
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Proxy error:', error);
    console.error('🔍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
    
    // Check if it's an abort error
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏰ Request was aborted (timeout)');
    }
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('aborted') || 
                          (error instanceof Error && error.name === 'AbortError');
    
    return NextResponse.json(
      { 
        error: true, 
        message: errorMessage,
        type: isTimeoutError ? 'timeout' : 'fetch_error',
        timestamp: new Date().toISOString(),
        debug: process.env.NODE_ENV === 'development' ? {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : 'No stack trace',
          appsScriptUrl: process.env.APP_SCRIPT_URL?.substring(0, 50) + '...',
        } : undefined
      },
      { 
        status: isTimeoutError ? 408 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 