import { NextResponse } from 'next/server';
import { authOptions } from '../utils/auth';

export async function GET() {
  const providers = {
    github: {
      id: "github",
      name: "GitHub",
      type: "oauth",
      signinUrl: "/api/auth/signin/github",
      callbackUrl: "/api/auth/callback/github"
    }
  };

  return NextResponse.json(providers);
} 