import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting startup vector synchronization...')

    // Call the periodic sync function
    const { data: syncResult, error: syncError } = await supabase
      .rpc('periodic_vector_sync')
      .single()

    if (syncError) {
      throw syncError
    }

    console.log('Sync completed:', syncResult)

    // Get current statistics
    const { data: stats, error: statsError } = await supabase
      .from('startup_details')
      .select('vector_id')
      .then(result => {
        if (result.error) return { error: result.error }
        
        const total = result.data?.length || 0
        const linked = result.data?.filter(d => d.vector_id !== null).length || 0
        const unlinked = total - linked
        
        return {
          data: {
            total,
            linked,
            unlinked,
            linkPercentage: total > 0 ? ((linked / total) * 100).toFixed(2) : 0
          }
        }
      })

    if (statsError) {
      throw statsError
    }

    // Log any orphaned records for monitoring
    if (syncResult.orphaned_details > 0) {
      console.warn(`Found ${syncResult.orphaned_details} orphaned startup_details records with no matching vectors`)
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      syncResult: {
        newlyLinked: syncResult.synced_count,
        duplicateCompanies: syncResult.duplicate_check,
        orphanedDetails: syncResult.orphaned_details
      },
      currentStats: stats,
      message: `Successfully synced ${syncResult.synced_count} records`
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in sync-startup-vectors:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
})