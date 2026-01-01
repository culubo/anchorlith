import { NextResponse } from 'next/server'
import { exportUserData } from '@/lib/export'

export async function GET() {
  try {
    const data = await exportUserData()
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="anchorlith-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    )
  }
}

