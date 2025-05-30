import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error') || 'Unknown error';
 
  return NextResponse.json({ error }, { status: 400 });
} 