import { execFile } from 'node:child_process';
import { open, stat } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';

export const inject = ['connection'];

const runScript = promisify(execFile);
const ROOT = '/Users/shaoqicheng/Documents/x 自动化 /x-desktop-auto';
const SERVICES = {
  status: { url: 'http://127.0.0.1:8787/status', field: 'workflow', name: 'status_server' },
  control: { url: 'http://127.0.0.1:8788/control/status', field: 'control', name: 'control_server' },
};

async function probe({ url, field }) {
  try {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(1500) });
    if (!response.ok) {
      await response.body?.cancel();
      return { detail: `GET ${url}: HTTP ${response.status}` };
    }
    const data = await response.json();
    if (data?.ok === true && data[field] && typeof data[field] === 'object' && !Array.isArray(data[field])) return null;
    return { detail: `GET ${url}: unexpected response` };
  } catch (error) {
    const code = error.cause?.code;
    return { refused: code === 'ECONNREFUSED', detail: `GET ${url}: ${code || error.message}` };
  }
}

async function startupLog(logPath, previous) {
  try {
    const log = await open(logPath, 'r');
    try {
      const current = await log.stat();
      const offset = previous?.ino === current.ino && previous.size <= current.size ? previous.size : 0;
      const buffer = Buffer.alloc(Math.min(current.size - offset, 2048));
      const { bytesRead } = await log.read(buffer, 0, buffer.length, current.size - buffer.length);
      return buffer.toString('utf8', 0, bytesRead).trim().split(/\r?\n/).at(-1).slice(0, 500);
    } finally {
      await log.close();
    }
  } catch {
    return '';
  }
}

async function startIfNeeded(service) {
  const before = await probe(service);
  if (!before) return { running: true };
  // A timeout or bad response can come from a busy service or an occupied port.
  if (!before.refused) return { running: false, error: before.detail };

  const script = `start_${service.name}.sh`;
  const logPath = `${ROOT}/logs/${service.name}.log`;
  const previousLog = await stat(logPath).catch(() => undefined);
  let scriptError = '';
  try {
    await runScript('/bin/bash', [`${ROOT}/scripts/${script}`], {
      timeout: 8000,
      maxBuffer: 16 * 1024,
      env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: process.env.LANG, NO_PROXY: '127.0.0.1' },
    });
  } catch (error) {
    scriptError = error.killed ? 'timed out' : String(error.stderr?.trim() || error.code || error.message).slice(0, 500);
  }

  // The scripts launch in the background. Confirm readiness from the HTTP service.
  let failure;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (attempt > 0) await delay(250);
    failure = await probe(service);
    if (!failure) return { running: true };
  }
  const log = await startupLog(logPath, previousLog);
  return { running: false, error: [`${script}${scriptError ? ': ' + scriptError : ''}`, log, failure.detail].filter(Boolean).join(' · ') };
}

export function apply(ctx) {
  const inFlight = new Map();
  const start = (id) => {
    if (!inFlight.has(id)) {
      inFlight.set(id, startIfNeeded(SERVICES[id]).finally(() => inFlight.delete(id)));
    }
    return inFlight.get(id);
  };

  ctx.effect(() => ctx.connection.fetch.register({
    path: '/api/x-workflow-monitor/services/start',
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch(request) {
      if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
        return Response.json({ error: 'Expected application/json' }, { status: 415 });
      }
      const body = await request.json().catch(() => null);
      const ids = body?.services;
      if (!Array.isArray(ids) || ids.length < 1 || ids.length > 2 || Object.keys(body).length !== 1 ||
          ids.some((id) => typeof id !== 'string' || !Object.hasOwn(SERVICES, id))) {
        return Response.json({ error: 'Expected services containing status and/or control' }, { status: 400 });
      }

      const results = await Promise.all([...new Set(ids)].map(async (id) => [id, await start(id)]));
      return Response.json({ services: Object.fromEntries(results) }, {
        status: results.every(([, result]) => result.running) ? 200 : 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    },
  }), 'x-workflow-monitor: start local HTTP services');
}
