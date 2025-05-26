import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect(new URL('/api/auth/providers', 'http://localhost:3000'));
} 