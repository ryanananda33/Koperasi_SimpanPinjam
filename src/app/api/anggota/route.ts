import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Instantiate Supabase Admin Client using Service Role Key
const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!url || !serviceRole) {
    throw new Error('Missing Supabase URL or Service Role Key in environment variables.');
  }
  
  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// 1. Create a new member (Admin Auth API)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, nip, phone, status, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        nip,
        address,
        phone,
        role: 'anggota',
        status
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Insert into public.users (trigger on_auth_user_created handles this, but we run an upsert/update to ensure all values are identical)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        nip: nip || null,
        phone: phone || null,
        address: address || null,
        status: status || 'aktif',
        updated_at: new Date().toISOString()
      })
      .eq('id', authUser.user.id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: authUser.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. Update a member
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, nip, phone, status, address } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name, and email are required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Check if email or NIP is taken by another user
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, nip')
      .or(`email.eq.${email},nip.eq.${nip}`)
      .neq('id', id)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Alamat email sudah terdaftar!' }, { status: 400 });
      }
      if (nip && existingUser.nip === nip) {
        return NextResponse.json({ error: 'NIP sudah terdaftar!' }, { status: 400 });
      }
    }

    // Update Auth User
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        name,
        nip,
        address,
        phone,
        status
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Update public.users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        email,
        nip: nip || null,
        phone: phone || null,
        address: address || null,
        status: status || 'aktif',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. Delete a member
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Delete Auth User (cascades to public.users via Foreign Key constraints)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
