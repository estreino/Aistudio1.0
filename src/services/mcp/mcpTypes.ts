export type McpScope =
  | 'read:routine:today'
  | 'read:routine:summary'
  | 'read:routine:all';

export interface McpToken {
  id: string;
  name: string;
  tokenHash: string; // Hash or masked identifier
  tokenRaw?: string; // Only displayed immediately upon creation
  scopes: McpScope[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string | null;
  revoked: boolean;
}

export interface McpAuditLog {
  id: string;
  timestamp: string;
  tokenId: string;
  clientName: string;
  scope: McpScope;
  resourceOrTool: string;
  status: 'granted' | 'denied' | 'error';
  reason?: string;
  executionTimeMs?: number;
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  requiredScope: McpScope;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  requiredScope: McpScope;
}

export interface McpManifest {
  protocolVersion: string;
  serverInfo: {
    name: string;
    version: string;
    description: string;
    author: string;
  };
  capabilities: {
    resources: boolean;
    tools: boolean;
    prompts: boolean;
    readOnly: true;
    mutationsAllowed: false;
  };
  supportedScopes: {
    scope: McpScope;
    name: string;
    description: string;
  }[];
  resources: McpResourceDefinition[];
  tools: McpToolDefinition[];
}

export interface McpQueryRequest {
  resource?: string;
  tool?: string;
  params?: Record<string, any>;
}

export interface McpQueryResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  auditLogId?: string;
  serverTime: string;
}
