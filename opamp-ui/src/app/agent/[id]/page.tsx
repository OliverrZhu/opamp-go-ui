import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import AgentTabs from "./AgentTabs";

interface AgentHealth {
  Up?: boolean;
  StartTimeNano?: string;
}

interface AgentStatus {
  instance_uid: string;
  sequence_num: number;
  agent_description: {
    identifying_attributes: Array<{
      key: string;
      value: { Value: { StringValue: string } };
    }>;
    non_identifying_attributes: Array<{
      key: string;
      value: { Value: { StringValue: string } };
    }>;
  };
  Health?: AgentHealth;
}

interface Agent {
  InstanceId: number[];
  InstanceIdStr: string;
  Status: AgentStatus;
  EffectiveConfig: string;
  StartedAt: string;
  ClientCertSha256Fingerprint: string;
}

function StatusBadge({ isUp }: { isUp?: boolean }) {
  return (
    <div
      className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      ${
        isUp
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      <div
        className={`
        w-2 h-2 rounded-full mr-2
        ${isUp ? "bg-green-500" : "bg-red-500"}
      `}
      />
      {isUp ? "Up" : "Down"}
    </div>
  );
}

async function getAgent(id: string) {
  const headersList = headers();
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4321";

  try {
    const res = await fetch(`${baseUrl}/api/agent/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return notFound();
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data as Agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
    throw error;
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  if (!id) {
    return notFound();
  }

  let agent: Agent;
  try {
    agent = await getAgent(id);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Agent Details
            </h1>
            <div className="text-red-600 mb-4">
              Error loading agent details. Please check the server connection.
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Agents List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Agent Details</h1>
          </div>
          <StatusBadge isUp={agent.Status?.Health?.Up} />
        </div>

        <AgentTabs agent={agent} />
      </div>
    </div>
  );
}
