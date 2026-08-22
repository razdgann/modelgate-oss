const bool = (v, fallback = false) => v == null ? fallback : /^(1|true|yes)$/i.test(v);
const integer = (v, fallback) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : fallback; };

export function config(env = process.env) {
  return {
    host: env.MODELGATE_HOST || '127.0.0.1',
    port: integer(env.MODELGATE_PORT, 8080),
    dashboardPort: integer(env.MODELGATE_DASHBOARD_PORT, 3000),
    database: env.MODELGATE_DATABASE_URL || './data/modelgate.db',
    captureContent: bool(env.MODELGATE_CAPTURE_CONTENT),
    logLevel: env.MODELGATE_LOG_LEVEL || 'info',
    timeoutMs: integer(env.MODELGATE_PROVIDER_TIMEOUT_MS, 120000),
    maxRequestBytes: integer(env.MODELGATE_MAX_REQUEST_BYTES, 10 * 1024 * 1024),
    demoMode: bool(env.MODELGATE_DEMO_MODE),
    openaiUrl: env.MODELGATE_OPENAI_URL || 'https://api.openai.com',
    anthropicUrl: env.MODELGATE_ANTHROPIC_URL || 'https://api.anthropic.com'
  };
}
