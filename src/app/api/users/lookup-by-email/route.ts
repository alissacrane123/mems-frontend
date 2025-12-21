import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use the database function to lookup user
    const { data, error } = await supabase.rpc('get_user_id_by_email', {
      user_email: email.toLowerCase().trim()
    });

    if (error) {
      console.error('Error looking up user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to lookup user' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, exists: false, message: 'No user found with this email' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: true,
      userId: data
    });
  } catch (error) {
    console.error('User lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
