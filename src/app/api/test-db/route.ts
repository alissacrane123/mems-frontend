import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Simple connection test using auth status
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error && error.message !== 'Auth session missing!') {
      console.error('Supabase connection error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Database connection failed'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Connected to Supabase successfully! 🎉',
      connectionStatus: 'Active',
      user: user ? 'Authenticated' : 'Anonymous (expected)',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection test failed'
    }, { status: 500 })
  }
}