import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { video_id, body } = await req.json()

    // Validate input
    if (!video_id || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing video_id or body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate body length
    if (body.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Comment body cannot be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (body.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Comment body too long (max 1000 characters)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the video exists
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('id')
      .eq('id', video_id)
      .single()

    if (videoError || !video) {
      console.error('Video not found:', videoError)
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert the comment
    const { data: comment, error: insertError } = await supabaseClient
      .from('comments')
      .insert({
        video_id: video_id,
        user_id: user.id,
        body: body.trim()
      })
      .select(`
        id,
        video_id,
        user_id,
        body,
        created_at,
        profiles!inner(email)
      `)
      .single()

    if (insertError) {
      console.error('Error inserting comment:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create comment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the created comment
    return new Response(
      JSON.stringify({
        success: true,
        comment: comment
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})