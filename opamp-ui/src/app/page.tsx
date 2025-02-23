import Link from 'next/link';

async function getAgents() {
  const res = await fetch('http://localhost:3000/api/agents');
  if (!res.ok) {
    throw new Error('Failed to fetch agents');
  }
  return res.json();
}

export default async function Home() {
  let agents = [];
  
  try {
    agents = await getAgents();
  } catch (error) {
    console.error(error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">OpAMP Server</h1>
        <div className="text-red-500">Error loading agents. Please check the server connection.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OpAMP Server</h1>
      <h2 className="text-xl mb-4">Agents</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Instance ID</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent: any) => (
            <tr key={agent.InstanceIdStr} className="border-b">
              <td className="p-2">
                <Link 
                  href={`/agent/${agent.InstanceIdStr}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {agent.InstanceIdStr}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
