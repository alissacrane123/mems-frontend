import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test if tables exist by querying their structure
    const { data: entriesData, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .limit(1)

    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .limit(1)

    // Check for specific errors that indicate table doesn't exist
    const entriesExists = !entriesError || entriesError.code !== '42P01'
    const photosExists = !photosError || photosError.code !== '42P01'

    if (!entriesExists || !photosExists) {
      return NextResponse.json({
        success: false,
        message: 'Database tables not found',
        entriesExists,
        photosExists,
        errors: {
          entries: entriesError?.message,
          photos: photosError?.message
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully! 🎉',
      tables: {
        entries: {
          exists: true,
          error: entriesError?.code === 'PGRST116' ? 'Empty (expected)' : null
        },
        photos: {
          exists: true,
          error: photosError?.code === 'PGRST116' ? 'Empty (expected)' : null
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Schema test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database schema test failed'
    }, { status: 500 })
  }
}