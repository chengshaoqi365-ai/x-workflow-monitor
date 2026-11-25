import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

const execFile = mock.fn();
mock.module('node:child_process', { exports: { execFile } });
const { apply } = await import('../index.js');

const endpoints = {
  status: 'http://127.0.0.1:8787/status',
  control: 'http://127.0.0.1:8788/control/status',
};
const scriptRoot = '/Users/shaoqicheng/Documents/x 自动化 /x-desktop-auto/scripts';

function setup(t, { running = [], busy, fail, launchDelay = 0 } = {}) {
  const ready = new Set(running);
  const scripts = [];
  execFile.mock.mockImplementation((command, [script], options, callback) => {
    assert.equal(command, '/bin/bash');
    assert.ok(options.timeout > 0);
    scripts.push(script);
    const service = script === `${scriptRoot}/start_status_server.sh` ? 'status' : 'control';
    assert.equal(script, `${scriptRoot}/start_${service}_server.sh`);
    setTimeout(() => {
      if (service === fail) {
        callback(Object.assign(new Error('Command failed'), { code: 1, stderr: 'python3: command not found' }));
        return;
      }
      ready.add(service);
      callback(null, '', '');
    }, launchDelay);
  });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const service = Object.keys(endpoints).find((id) => endpoints[id] === url);
    assert.ok(service);
    assert.equal(options.redirect, 'error');
    if (service === busy) throw new DOMException('The operation timed out', 'TimeoutError');
    if (!ready.has(service)) throw new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } });
    return Response.json({ ok: true, [service === 'status' ? 'workflow' : 'control']: {} });
  });
  let route;
  apply({ effect: (register) => register(), connection: { fetch: { register: (value) => { route = value; } } } });
  assert.deepEqual(route?.methods, ['POST']);
  assert.equal(route.path, '/api/x-workflow-monitor/services/start');
  return {
    scripts,
    start: (body = '{"services":["status","control"]}', type = 'application/json') => route.fetch(new Request(`http://127.0.0.1:3080${route.path}`, {
      method: 'POST', headers: { 'Content-Type': type }, body,
    })),
  };
}

test('starts both missing services once across concurrent requests', async (t) => {
  const { scripts, start } = setup(t, { launchDelay: 20 });
  const responses = await Promise.all([start(), start()]);
  for (const response of responses) {
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      services: { status: { running: true }, control: { running: true } },
    });
  }
  assert.deepEqual(scripts.toSorted(), ['control', 'status'].map((id) => `${scriptRoot}/start_${id}_server.sh`));
  assert.equal((await start()).status, 200);
  assert.equal(scripts.length, 2);
});

for (const alive of ['status', 'control']) {
  test(`leaves the running ${alive} service alone`, async (t) => {
    const { scripts, start } = setup(t, { running: [alive] });
    assert.equal((await start()).status, 200);
    const missing = alive === 'status' ? 'control' : 'status';
    assert.deepEqual(scripts, [`${scriptRoot}/start_${missing}_server.sh`]);
  });
}

test('reports which startup failed and retains the other success', async (t) => {
  const { start } = setup(t, { fail: 'control' });
  const response = await start();
  assert.equal(response.status, 503);
  const { services } = await response.json();
  assert.deepEqual(services.status, { running: true });
  assert.equal(services.control.running, false);
  assert.match(services.control.error, /start_control_server\.sh.*python3: command not found/);
});

test('starts only the requested service when both are down', async (t) => {
  const { scripts, start } = setup(t);
  const response = await start('{"services":["control"]}');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { services: { control: { running: true } } });
  assert.deepEqual(scripts, [`${scriptRoot}/start_control_server.sh`]);
});

test('does not start a second instance when a status request times out', async (t) => {
  const { scripts, start } = setup(t, { busy: 'control' });
  const response = await start('{"services":["control"]}');
  assert.equal(response.status, 503);
  assert.match((await response.json()).services.control.error, /timed out/);
  assert.deepEqual(scripts, []);
});

test('rejects caller-supplied command or path fields and simple form requests', async (t) => {
  const { scripts, start } = setup(t);
  assert.equal((await start('{"command":"test","script":"/tmp/other.sh"}')).status, 400);
  assert.equal((await start('{')).status, 400);
  assert.equal((await start('{}', 'text/plain')).status, 415);
  assert.deepEqual(scripts, []);
});
