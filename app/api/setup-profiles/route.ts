import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No auth' }, { status: 401 })

    // Intentar un select simple para ver si la tabla existe
    const { error: checkError } = await supabase
      .from('keeper_profiles')
      .select('id')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({ ok: true, message: 'Table exists' })
    }

    // Si no existe, intentar crear via SQL
    const createSQL = `
      create table if not exists keeper_profiles (
        id uuid default gen_random_uuid() primary key,
        user_id uuid not null references auth.users(id) on delete cascade,
        name text not null,
        role text,
        tone text,
        rules text[],
        extra text,
        emoji text,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
      
      alter table keeper_profiles enable row level security;
      
      create policy if not exists "Users own profiles"
        on keeper_profiles for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    `

    // Intentar via rpc exec_sql si existe
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createSQL })
    
    if (rpcError) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Table does not exist and could not be created automatically. Please run the migration manually.',
        sql: createSQL,
        error: rpcError.message
      })
    }

    return NextResponse.json({ ok: true, message: 'Table created' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
