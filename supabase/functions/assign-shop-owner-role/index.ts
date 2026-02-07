import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user has a shop
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id, name, city, category')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!shop) {
      return new Response(
        JSON.stringify({ error: 'Créez d\'abord une boutique' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Assign role (upsert to handle duplicates)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: user.id, role: 'shop_owner' },
        { onConflict: 'user_id,role', ignoreDuplicates: true }
      )

    if (roleError && roleError.code !== '23505') {
      console.error('Role error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Erreur attribution rôle' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Notify all super admins about new shop pending validation
    const { data: admins } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.user_id,
        title: '🏪 Nouvelle boutique en attente',
        message: `La boutique "${shop.name}" (${shop.category}) à ${shop.city} attend votre validation.`,
        type: 'new_shop',
        related_id: shop.id,
      }))

      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('Notification error:', notifError)
        // Don't fail the whole operation for notification errors
      } else {
        console.log(`Notifications sent to ${admins.length} admin(s)`)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
