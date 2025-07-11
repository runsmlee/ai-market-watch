import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get a few records with different IDs to see the structure
    const sampleIds = [1079, 1082, 1080, 1, 2, 100]; // Mix of potentially empty and valid records
    
    const { data, error } = await supabase
      .from('startup_vectors')
      .select('id, metadata')
      .in('id', sampleIds);
      
    if (error) {
      return NextResponse.json({ error: error.message });
    }
    
    // Analyze the structure of each record
    const analysis = data?.map(record => ({
      id: record.id,
      hasMetadata: !!record.metadata,
      metadataType: typeof record.metadata,
      hasMetadataMetadata: !!(record.metadata?.metadata),
      hasOutput: !!(record.metadata?.output),
      hasCompany: !!(record.metadata?.output?.company),
      companyName: record.metadata?.output?.company?.company_name || 
                   record.metadata?.metadata?.['Company Name'] ||
                   record.metadata?.['Company Name'] || 
                   'NOT FOUND',
      metadataKeys: Object.keys(record.metadata || {}).slice(0, 5),
      outputKeys: record.metadata?.output ? Object.keys(record.metadata.output).slice(0, 5) : [],
      rawMetadata: JSON.stringify(record.metadata).substring(0, 200) + '...'
    }));
    
    return NextResponse.json({
      recordCount: data?.length || 0,
      analysis,
      message: 'Raw structure analysis of sample records'
    });
    
  } catch (error) {
    console.error('Debug raw endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}