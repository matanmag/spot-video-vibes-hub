
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video_id } = await req.json();

    if (!video_id) {
      return new Response(
        JSON.stringify({ error: 'video_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceKey ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing like for user ${user.id} on video ${video_id}`);

    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabaseClient
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing like:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing like' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (existingLike) {
      // Like exists, delete it
      console.log('Removing existing like');
      const { error: deleteError } = await supabaseClient
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', video_id);

      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to remove like' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      // Like doesn't exist, create it
      console.log('Creating new like');
      const { error: insertError } = await supabaseClient
        .from('likes')
        .insert({
          user_id: user.id,
          video_id: video_id
        });

      if (insertError) {
        console.error('Error creating like:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to add like' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get total likes count for the video
    const { count: totalLikes, error: countError } = await supabaseClient
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', video_id);

    if (countError) {
      console.error('Error counting likes:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to count likes' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Total likes for video ${video_id}: ${totalLikes}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        liked: !existingLike, // true if we just added a like, false if we removed it
        totalLikes: totalLikes || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in like_video function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
