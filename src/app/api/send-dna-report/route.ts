import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, analysisResult, formData } = await request.json();
    
    // Store email in database (you'll implement this with Supabase)
    // For now, just log it
    console.log('Email collected:', {
      email,
      company: formData.companyName,
      timestamp: new Date().toISOString()
    });
    
    // In production, you would:
    // 1. Store email in Supabase emails table
    // 2. Generate PDF report
    // 3. Send email via SendGrid/Resend/etc.
    // 4. Track analytics
    
    // Mock response
    return NextResponse.json({
      success: true,
      message: 'Report sent successfully'
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send report' },
      { status: 500 }
    );
  }
}