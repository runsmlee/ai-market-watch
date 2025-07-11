import { NextRequest, NextResponse } from 'next/server';
import { generateDNAMatchPDF } from '@/lib/pdf-generator';
import { sendDNAMatchEmail, createDNAMatchEmailTemplate } from '@/lib/email';
import { saveDNAMatchReport, uploadPDFToStorage } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, analysisResult, formData } = await request.json();
    
    console.log('Received DNA report request for:', {
      email,
      company: formData.companyName,
      timestamp: new Date().toISOString()
    });

    // Extract the actual result from the n8n response
    console.log('=== FULL Analysis Result ===');
    console.log(JSON.stringify(analysisResult, null, 2));
    console.log('=== END Analysis Result ===');
    
    const actualResult = Array.isArray(analysisResult) 
      ? analysisResult[0]?.output 
      : analysisResult.output || analysisResult;
    
    console.log('=== EXTRACTED actualResult ===');
    console.log(JSON.stringify(actualResult, null, 2));
    console.log('=== END actualResult ===');
    
    if (!actualResult || !actualResult.matches) {
      console.error('❌ Invalid analysis result structure');
      console.error('actualResult:', actualResult);
      throw new Error('Invalid analysis result structure - no matches found');
    }

    // Transform the actualResult to match the expected format
    const transformedResult: any = {
      matches: (actualResult?.matches || []).map((match: any) => ({
        id: match.id,
        companyName: match.company_name,
        similarity: match.similarity_score,
        category: match.category,
        description: match.description,
        fundingRaised: match.total_funding,
        yearFounded: match.year_founded,
        whySimilar: match.why_similar,
        keyDifferentiators: match.key_differentiators,
        fundingStage: match.funding_stage,
        location: match.location,
      })),
      insights: {
        commonPatterns: actualResult?.insights?.common_patterns || [],
        differentiators: [], // Not provided by n8n, but expected by PDF
        opportunities: actualResult?.insights?.market_opportunities || [],
        recommendations: actualResult?.insights?.strategic_recommendations || [],
      },
      metadata: actualResult?.metadata,
    };

    // Generate PDF report
    console.log('Generating PDF report...');
    const pdfBuffer = await generateDNAMatchPDF({
      companyName: formData.companyName,
      companyData: formData,
      analysisResult: transformedResult,
    });

    // Upload PDF to Supabase Storage (skip if bucket doesn't exist)
    let pdfUrl = null;
    // Create safe filename by removing non-ASCII characters and spaces
    const safeCompanyName = formData.companyName
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-]/g, '') // Keep only alphanumeric and hyphens
      .toLowerCase();
    const fileName = `dna-reports/${safeCompanyName || 'company'}-${Date.now()}.pdf`;
    
    try {
      console.log('Uploading PDF to storage...');
      pdfUrl = await uploadPDFToStorage(pdfBuffer, fileName);
    } catch (error) {
      console.warn('PDF upload failed, will attach to email instead:', error);
    }

    // Save report metadata to database (skip if table doesn't exist)
    try {
      console.log('Saving report to database...');
      await saveDNAMatchReport({
        email,
        companyName: formData.companyName,
        companyData: formData,
        analysisResults: analysisResult,
        pdfUrl,
      });
    } catch (error) {
      console.warn('Database save failed, continuing with email:', error);
    }

    // Prepare email data
    const emailData = {
      companyName: formData.companyName,
      topMatches: (actualResult?.matches || []).slice(0, 3).map((match: any) => ({
        companyName: match.companyName || match.company_name,
        similarity: match.similarity || match.similarity_score,
        category: match.category,
      })),
      reportUrl: pdfUrl,
    };

    // Create email HTML
    const emailHtml = createDNAMatchEmailTemplate(emailData);

    // Send email with PDF attachment
    console.log('Sending email...');
    const emailResult = await sendDNAMatchEmail({
      to: email,
      subject: `Your AI Startup DNA Analysis Report - ${formData.companyName}`,
      html: emailHtml,
      attachments: pdfUrl ? undefined : [{
        filename: `${formData.companyName}-DNA-Analysis.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });

    if (!emailResult.success) {
      throw new Error(`Email sending failed: ${emailResult.error}`);
    }

    console.log('DNA report sent successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Report sent successfully',
      pdfUrl,
      emailMessageId: emailResult.messageId,
    });
    
  } catch (error) {
    console.error('Error processing DNA report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}