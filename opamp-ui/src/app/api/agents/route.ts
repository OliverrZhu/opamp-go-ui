import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4321';
  console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
  try {
    const res = await fetch(`${apiUrl}/api/agents`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return NextResponse.json(await res.json());
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 