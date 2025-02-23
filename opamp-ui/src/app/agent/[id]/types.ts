export interface AgentHealth {
  Up?: boolean;
  StartTimeNano?: string;
}

export interface AgentStatus {
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

export interface Agent {
  InstanceId: number[];
  InstanceIdStr: string;
  Status: AgentStatus;
  EffectiveConfig: string;
  StartedAt: string;
  ClientCertSha256Fingerprint: string;
} 