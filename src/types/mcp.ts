export interface MCPRequest {
  command: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
} 