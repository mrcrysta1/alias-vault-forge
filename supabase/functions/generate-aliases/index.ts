import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  baseEmail: string;
  count: number;
}

function generateRandomToken(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { baseEmail, count }: GenerateRequest = await req.json();

    console.log(`Generating ${count} aliases for ${baseEmail}`);

    // Validate inputs
    if (!baseEmail || !baseEmail.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (count < 1 || count > 100000) {
      return new Response(
        JSON.stringify({ error: 'Count must be between 1 and 100,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract email parts
    const [localPart, domain] = baseEmail.split('@');
    
    // Generate aliases in batches
    const batchSize = 1000;
    const batches = Math.ceil(count / batchSize);
    let totalGenerated = 0;

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, count - totalGenerated);
      const aliases = [];

      for (let i = 0; i < currentBatchSize; i++) {
        const token = generateRandomToken();
        const alias = `${localPart}+${token}@${domain}`;
        
        aliases.push({
          alias,
          token,
          used: false,
        });
      }

      // Insert batch
      const { error } = await supabase.from('aliases').insert(aliases);
      
      if (error) {
        console.error('Batch insert error:', error);
        // If there's a duplicate, just continue - some aliases might already exist
        if (!error.message.includes('duplicate')) {
          throw error;
        }
      }

      totalGenerated += currentBatchSize;
      console.log(`Generated ${totalGenerated}/${count} aliases`);
    }

    console.log(`Successfully generated ${totalGenerated} aliases`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: totalGenerated,
        message: `Generated ${totalGenerated} aliases successfully`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating aliases:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});