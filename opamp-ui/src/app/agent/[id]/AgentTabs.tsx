'use client';

import { useState } from 'react';
import { Agent } from './types';
import { DetailCard, AttributeList } from './components';
import MonacoEditor from '@/app/components/MonacoEditor';

interface Props {
  agent: Agent;
}

function TabButton({ isActive, children, onClick }: { 
  isActive: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      {children}
    </button>
  );
}

function ConfigEditor({ config, onSave }: { 
  config: string;
  onSave: (config: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [configValue, setConfigValue] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(configValue);
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Agent Configuration</h2>
        <div className="space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg 
                transition-colors font-medium text-sm"
            >
              Edit Configuration
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setConfigValue(config);
                  setError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg 
                  transition-colors font-medium text-sm"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg 
                  transition-colors font-medium text-sm
                  ${isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700'
                  }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="relative">
        <MonacoEditor
          value={configValue}
          onChange={setConfigValue}
          readOnly={!isEditing}
          height="500px"
        />
      </div>
    </div>
  );
}

export default function AgentTabs({ agent }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'config'>('details');

  const handleSaveConfig = async (newConfig: string) => {
    const res = await fetch(`/api/agent/${agent.InstanceIdStr}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config: newConfig }),
    });

    if (!res.ok) {
      throw new Error('Failed to save configuration');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex space-x-2">
          <TabButton 
            isActive={activeTab === 'details'} 
            onClick={() => setActiveTab('details')}
          >
            Details
          </TabButton>
          <TabButton 
            isActive={activeTab === 'config'} 
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </TabButton>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'details' ? (
          <div className="space-y-6">
            <DetailCard title="Instance ID">
              <p className="font-mono text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                {agent.InstanceIdStr}
              </p>
            </DetailCard>

            {agent.Status?.agent_description && (
              <>
                <AttributeList 
                  title="Identifying Attributes" 
                  attributes={agent.Status.agent_description.identifying_attributes} 
                />
                <AttributeList 
                  title="Non-Identifying Attributes" 
                  attributes={agent.Status.agent_description.non_identifying_attributes} 
                />
              </>
            )}

            {agent.Status && (
              <DetailCard title="Status Details">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-medium w-40 text-gray-700">Sequence Number:</span>
                    <span className="text-gray-600">{agent.Status.sequence_num}</span>
                  </div>
                </div>
              </DetailCard>
            )}

            {agent.ClientCertSha256Fingerprint && (
              <DetailCard title="Client Certificate">
                <p className="font-mono text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 break-all">
                  {agent.ClientCertSha256Fingerprint}
                </p>
              </DetailCard>
            )}
          </div>
        ) : (
          <ConfigEditor 
            config={agent.EffectiveConfig} 
            onSave={handleSaveConfig}
          />
        )}
      </div>
    </div>
  );
} 