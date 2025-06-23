import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      APPS_SCRIPT_URL: process.env.APPS_SCRIPT_URL ? 'SET' : 'NOT SET',
      APPS_SCRIPT_URL_LENGTH: process.env.APPS_SCRIPT_URL?.length || 0,
      APPS_SCRIPT_URL_FIRST_50: process.env.APPS_SCRIPT_URL?.substring(0, 50) + '...' || 'NOT SET'
    },
    timestamp: new Date().toISOString()
  });
} 