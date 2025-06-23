import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
} 