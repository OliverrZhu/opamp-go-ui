import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4321';
  try {
    const res = await fetch(`${apiUrl}/api/agent/${params.id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  
  if (body.config) {
    const res = await fetch('http://localhost:4321/save_config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `instanceid=${id}&config=${encodeURIComponent(body.config)}`,
    });
    return NextResponse.json({ status: res.status });
  } else {
    const res = await fetch('http://localhost:4321/rotate_client_cert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `instanceid=${id}`,
    });
    return NextResponse.json({ status: res.status });
  }
} 