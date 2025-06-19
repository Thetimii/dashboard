import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Demo email API is working!',
      timestamp: new Date().toISOString(),
      method: 'GET'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'API Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Demo email API is working!',
      timestamp: new Date().toISOString(),
      method: 'POST'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'API Error' },
      { status: 500 }
    )
  }
}
