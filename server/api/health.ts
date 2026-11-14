export interface HealthResponse {
  status: 'ok';
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  coppaProtectionActive: boolean;
  version: string;
}

const startTime = Date.now();

export function handleHealthCheck(): HealthResponse {
  return {
    status: 'ok',
    service: 'Junior Astronaut Mission Trainer API',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    coppaProtectionActive: true,
    version: '1.0.0'
  };
}
