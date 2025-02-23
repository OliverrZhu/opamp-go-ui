import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4321";
  const { id } = await context.params;

  if (!id) {
    return Response.json({ error: "Missing agent ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiUrl}/api/agent/${id}`);

    if (!res.ok) {
      if (res.status === 404) {
        return new Response("Not Found", { status: 404 });
      }
      throw new Error(`Backend server error: ${res.status}`);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching agent:", error);
    return Response.json(
      { error: "Failed to fetch agent data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4321";
  const { id } = await context.params;

  if (!id) {
    return Response.json({ error: "Missing agent ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${apiUrl}/api/agent/${id}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error updating agent config:", error);
    return Response.json(
      { error: "Failed to update agent configuration" },
      { status: 500 }
    );
  }
}
