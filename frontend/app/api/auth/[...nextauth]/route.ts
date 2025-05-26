import NextAuth from 'next-auth';
import { authOptions } from '../utils/auth';

// Log environment variables for debugging (without exposing secrets)
console.log('NextAuth Config - Environment Check:');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET');

// Create handler with imported auth options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };