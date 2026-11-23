window.__ModuleLoader__.load({
  id: '@local/x-workflow-monitor',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useRef, useState } = React;

    const NS = 'xWorkflowMonitor';
    const STATUS_ENDPOINT = 'http://127.0.0.1:8787/status';
    const CONTROL_STATUS_ENDPOINT = 'http://127.0.0.1:8788/control/status';
    const CONTROL_RUN_ENDPOINT = 'http://127.0.0.1:8788/control/run';
    const CONTROL_STOP_ENDPOINT = 'http://127.0.0.1:8788/control/stop';
    const PER_ROUND = 30;
    const CONTROL_POLL_MS = 2000;
    const STATUS_POLL_MS = 5000;

    const zh = {
      'panel.label': 'X 工作流',
      'page.title': 'X 自动化工作流',
      'page.hint.loading': '正在连接状态服务…',
      'page.hint.updated': '状态更新时间 {time}',
      'page.hint.offline': '状态服务未启动',
      'chip.gate': '安全门',
      'chip.gate.clean': 'CLEAN',
      'chip.gate.unknown': '未确认',
      'chip.discover': 'Connect 发现',
      'chip.discover.value': '{count} 条',
      'chip.checked': '本轮检查',
      'chip.checked.value': '{checked}/30 · 已见 {seen}',
      'chip.roundActions': '本轮动作',
      'chip.roundActions.value': '关 {follows} · 赞 {likes} · 回 {replies}',
      'chip.today': '今日动作',
      'chip.today.value': '赞 {likes} · 回 {replies} · 关 {follows}',
      'control.title': '运行控制',
      'control.rounds': '轮数',
      'control.perRound': '每轮 30 个 id',
      'control.start': '开始运行',
      'control.dryRun': 'dry-run',
      'control.stop': '停止',
      'control.retry': '重试',
      'control.starting': '启动中…',
      'control.stopping': '停止中…',
      'control.note': '开始运行会真实执行关注、点赞与回复；dry-run 只读取页面，不点击任何按钮。',
      'control.status': '运行状态',
      'control.round': '当前轮次',
      'control.checked': '本轮检查',
      'control.follows': '新关注',
      'control.likes': '点赞',
      'control.replies': '回复',
      'control.exitCode': '退出码',
      'control.roundTotal': '共 {total} 轮',
      'control.dryRunTag': 'dry-run',
      'control.log': '运行日志',
      'control.logMeta': '最近 {count} 行',
      'control.log.empty': '暂无日志',
      'state.running': '运行中',
      'state.stopped': '已停止',
      'state.completed': '已完成',
      'state.failed': '失败',
      'state.idle': '未运行',
      'state.disconnected': '未连接',
      'error.controlUnavailable': '控制服务未启动，请在 x-desktop-auto 运行 bash scripts/start_control_server.sh',
      'error.alreadyRunning': '已有任务在运行',
      'error.startFailed': '启动失败：{detail}',
      'error.stopFailed': '停止失败：{detail}',
      'error.notRunning': '当前没有运行中的任务',
      'recent.discoveries': '最近发现',
      'recent.candidates': '最近候选人',
      'recent.empty': '暂无记录',
      'recent.followers': '{count} 粉丝',
      'recent.statusService': '状态服务未连接。在 x-desktop-auto 目录运行：python3 scripts/status_server.py',
    };

    const en = {
      'panel.label': 'X Workflow',
      'page.title': 'X automation workflow',
      'page.hint.loading': 'Connecting to the status service…',
      'page.hint.updated': 'Status updated at {time}',
      'page.hint.offline': 'Status service is not running',
      'chip.gate': 'Safety gate',
      'chip.gate.clean': 'CLEAN',
      'chip.gate.unknown': 'Unconfirmed',
      'chip.discover': 'Connect discoveries',
      'chip.discover.value': '{count} tweets',
      'chip.checked': 'Checked this round',
      'chip.checked.value': '{checked}/30 · {seen} seen',
      'chip.roundActions': 'Round actions',
      'chip.roundActions.value': 'Follow {follows} · Like {likes} · Reply {replies}',
      'chip.today': 'Today',
      'chip.today.value': 'Like {likes} · Reply {replies} · Follow {follows}',
      'control.title': 'Run control',
      'control.rounds': 'Rounds',
      'control.perRound': '30 ids per round',
      'control.start': 'Start run',
      'control.dryRun': 'dry-run',
      'control.stop': 'Stop',
      'control.retry': 'Retry',
      'control.starting': 'Starting…',
      'control.stopping': 'Stopping…',
      'control.note': 'Start run performs real follows, likes and replies; dry-run only reads pages without clicking.',
      'control.status': 'Run status',
      'control.round': 'Current round',
      'control.checked': 'Checked this round',
      'control.follows': 'New follows',
      'control.likes': 'Likes',
      'control.replies': 'Replies',
      'control.exitCode': 'Exit code',
      'control.roundTotal': '{total} rounds total',
      'control.dryRunTag': 'dry-run',
      'control.log': 'Run log',
      'control.logMeta': 'last {count} lines',
      'control.log.empty': 'No log yet',
      'state.running': 'Running',
      'state.stopped': 'Stopped',
      'state.completed': 'Completed',
      'state.failed': 'Failed',
      'state.idle': 'Idle',
      'state.disconnected': 'Disconnected',
      'error.controlUnavailable': 'Control service is not running. In x-desktop-auto run bash scripts/start_control_server.sh',
      'error.alreadyRunning': 'A task is already running',
      'error.startFailed': 'Failed to start: {detail}',
      'error.stopFailed': 'Failed to stop: {detail}',
      'error.notRunning': 'There is no running task',
      'recent.discoveries': 'Recent discoveries',
      'recent.candidates': 'Recent candidates',
      'recent.empty': 'No records',
      'recent.followers': '{count} followers',
      'recent.statusService': 'Status service is not connected. In the x-desktop-auto directory run: python3 scripts/status_server.py',
    };

    const T = {
      text: 'var(--dsw-alias-label-primary, #111827)',
      secondary: 'var(--dsw-alias-label-secondary, #4b5563)',
      muted: 'var(--dsw-alias-label-tertiary, #6b7280)',
      border: 'var(--dsw-alias-border-l2, #e5e7eb)',
      borderStrong: 'var(--dsw-alias-border-l3, #d1d5db)',
      bg: 'var(--dsw-alias-bg-layer-2, #ffffff)',
      soft: 'var(--dsw-alias-bg-layer-1, #f8fafc)',
      green: 'var(--dsw-alias-state-success-primary, #16a34a)',
      red: 'var(--dsw-alias-state-error-primary, #dc2626)',
      blue: 'var(--dsw-alias-state-business-primary, #2563eb)',
      orange: 'var(--dsw-alias-state-warn-primary, #d97706)',
      onColor: 'var(--dsw-alias-label-on-color, #ffffff)',
      mono: 'var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)',
    };

    function Dot({ color }) {
      return h('span', {
        style: {
          display: 'inline-block', width: 8, height: 8, borderRadius: 99,
          background: color, flex: 'none',
        },
      });
    }

    function Chip({ label, value, color }) {
      return h('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 11px', borderRadius: 8, background: T.soft,
          border: '1px solid ' + T.border, whiteSpace: 'nowrap',
        },
      },
        h(Dot, { color }),
        h('span', { style: { color: T.muted, fontSize: 12 } }, label),
        h('strong', { style: { color: T.text, fontWeight: 600, fontSize: 12 } }, value)
      );
    }

    function Button({ children, onClick, disabled, variant, ariaLabel, title }) {
      const [hover, setHover] = useState(false);
      const base = {
        primary: { background: T.red, color: T.onColor, border: '1px solid ' + T.red },
        secondary: { background: T.bg, color: T.text, border: '1px solid ' + T.borderStrong },
        stop: { background: 'transparent', color: T.secondary, border: '1px solid ' + T.borderStrong },
      };
      const look = base[variant || 'secondary'];
      return h('button', {
        type: 'button',
        onClick,
        disabled,
        'aria-label': ariaLabel || undefined,
        title: title || undefined,
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        style: {
          ...look,
          padding: '7px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.4,
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          filter: !disabled && hover ? 'brightness(0.95)' : 'none',
          transition: 'filter .15s ease',
          whiteSpace: 'nowrap',
        },
      }, children);
    }

    function StatusPill({ tone, label }) {
      return h('span', {
        style: {
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 999, background: T.soft,
          border: '1px solid ' + T.border, color: tone,
          fontSize: 12, fontWeight: 650, whiteSpace: 'nowrap',
        },
      }, h(Dot, { color: tone }), label);
    }

    function Stat({ label, value, suffix }) {
      return h('div', {
        style: {
          display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px',
          background: T.soft, border: '1px solid ' + T.border, borderRadius: 10, minWidth: 0,
        },
      },
        h('span', { style: { fontSize: 11, color: T.muted, whiteSpace: 'nowrap' } }, label),
        h('span', {
          style: {
            fontSize: 18, fontWeight: 650, color: T.text,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.25,
          },
        },
          String(value == null ? '—' : value),
          suffix ? h('span', { style: { fontSize: 11, fontWeight: 400, color: T.muted, marginLeft: 4 } }, suffix) : null
        )
      );
    }

    function useWorkflowData() {
      const [state, setState] = useState({ loading: true, data: null, error: '' });
      useEffect(() => {
        let alive = true;
        const tick = async () => {
          try {
            const res = await fetch(STATUS_ENDPOINT, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (alive) setState({ loading: false, data, error: '' });
          } catch (err) {
            if (alive) setState({ loading: false, data: null, error: String(err) });
          }
        };
        tick();
        const timer = setInterval(tick, STATUS_POLL_MS);
        return () => { alive = false; clearInterval(timer); };
      }, []);
      return state;
    }

    function useControlStatus() {
      const [state, setState] = useState({ loading: true, connected: false, control: null });
      const adopt = useCallback((control) => {
        if (!control) return;
        setState({ loading: false, connected: true, control });
      }, []);
      const refresh = useCallback(async () => {
        try {
          const res = await fetch(CONTROL_STATUS_ENDPOINT, { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          if (!data || data.ok !== true || !data.control) throw new Error('invalid response');
          setState({ loading: false, connected: true, control: data.control });
          return data.control;
        } catch (err) {
          setState((prev) => ({ loading: false, connected: false, control: prev.control }));
          return null;
        }
      }, []);
      useEffect(() => {
        let alive = true;
        const tick = async () => {
          try {
            const res = await fetch(CONTROL_STATUS_ENDPOINT, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (!data || data.ok !== true || !data.control) throw new Error('invalid response');
            if (alive) setState({ loading: false, connected: true, control: data.control });
          } catch (err) {
            if (alive) setState((prev) => ({ loading: false, connected: false, control: prev.control }));
          }
        };
        tick();
        const timer = setInterval(tick, CONTROL_POLL_MS);
        return () => { alive = false; clearInterval(timer); };
      }, []);
      return { ...state, refresh, adopt };
    }

    function summary(data) {
      const wf = data && data.workflow ? data.workflow : {};
      return {
        account: data && data.account ? String(data.account) : '',
        clean: wf.chrome_clean === true,
        tweets: wf.tweets || 0,
        actions: wf.actions || {},
        candidates: wf.candidates || {},
        connect: wf.connect || {},
        connectSeen: wf.connect_seen || 0,
      };
    }

    function runStateOf(control, connected) {
      if (!connected) return { key: 'disconnected', label: 'state.disconnected', color: T.red };
      if (!control) return { key: 'idle', label: 'state.idle', color: T.muted };
      if (control.running) return { key: 'running', label: 'state.running', color: T.blue };
      if (control.exit_code === 0) return { key: 'completed', label: 'state.completed', color: T.green };
      if (control.exit_code === -15 || control.exit_code === -9 || control.exit_code === 143) {
        return { key: 'stopped', label: 'state.stopped', color: T.orange };
      }
      if (control.exit_code != null) return { key: 'failed', label: 'state.failed', color: T.red };
      return { key: 'idle', label: 'state.idle', color: T.muted };
    }

    function clampRounds(value) {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed)) return 3;
      return Math.min(10, Math.max(1, parsed));
    }

    function StatusRow({ t, data }) {
      const s = summary(data);
      return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 7 } },
        h(Chip, { label: t('chip.gate'), value: s.clean ? t('chip.gate.clean') : t('chip.gate.unknown'), color: s.clean ? T.green : T.orange }),
        h(Chip, { label: t('chip.discover'), value: t('chip.discover.value', { count: s.tweets }), color: T.blue }),
        h(Chip, {
          label: t('chip.checked'),
          value: t('chip.checked.value', { checked: s.connect.checked || 0, seen: s.connectSeen }),
          color: T.blue,
        }),
        h(Chip, {
          label: t('chip.roundActions'),
          value: t('chip.roundActions.value', {
            follows: s.connect.new_follows || 0,
            likes: s.connect.likes || 0,
            replies: s.connect.replies || 0,
          }),
          color: T.green,
        }),
        h(Chip, {
          label: t('chip.today'),
          value: t('chip.today.value', {
            likes: s.actions.like || 0,
            replies: s.actions.reply || 0,
            follows: s.actions.follow || 0,
          }),
          color: T.green,
        })
      );
    }

    function ControlPanel({ t, data, controlApi }) {
      const [roundsText, setRoundsText] = useState('3');
      const [pending, setPending] = useState('');
      const [error, setError] = useState('');
      const logRef = useRef(null);

      const control = controlApi.control;
      const connected = controlApi.connected;
      const running = !!(control && control.running);
      const state = runStateOf(control, connected);
      const s = summary(data);
      const connect = s.connect;
      const canStart = connected && !running && !pending;
      const canStop = connected && running && !pending;

      const logLines = String((control && control.log_tail) || '')
        .split(/\r?\n/)
        .filter((line, index, lines) => !(index === lines.length - 1 && line === ''));
      const logText = logLines.slice(-20).join('\n');

      useEffect(() => {
        const node = logRef.current;
        if (node) node.scrollTop = node.scrollHeight;
      }, [logText]);

      const post = useCallback(async (url, body) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body || {}),
        });
        let payload = null;
        try { payload = await res.json(); } catch (err) { payload = null; }
        return { res, payload };
      }, []);

      const start = async (dryRun) => {
        if (!canStart) return;
        const rounds = clampRounds(roundsText);
        setRoundsText(String(rounds));
        setPending(dryRun ? 'dry' : 'run');
        setError('');
        try {
          const { res, payload } = await post(CONTROL_RUN_ENDPOINT, {
            rounds,
            max_checks: PER_ROUND,
            dry_run: dryRun,
          });
          const message = payload && (payload.message || payload.error);
          if (res.status === 409 || message === 'already_running') {
            if (payload && payload.control) controlApi.adopt(payload.control);
            setError(t('error.alreadyRunning'));
            return;
          }
          if (!res.ok || !payload || payload.ok !== true) {
            setError(t('error.startFailed', { detail: message || ('HTTP ' + res.status) }));
            return;
          }
          if (payload.control) controlApi.adopt(payload.control);
          await controlApi.refresh();
        } catch (err) {
          setError(t('error.controlUnavailable'));
        } finally {
          setPending('');
        }
      };

      const stop = async () => {
        if (!canStop) return;
        setPending('stop');
        setError('');
        try {
          const { res, payload } = await post(CONTROL_STOP_ENDPOINT, {});
          const message = payload && (payload.message || payload.error);
          if (res.status === 409 || message === 'not_running') {
            if (payload && payload.control) controlApi.adopt(payload.control);
            setError(t('error.notRunning'));
            return;
          }
          if (!res.ok || !payload || payload.ok !== true) {
            setError(t('error.stopFailed', { detail: message || ('HTTP ' + res.status) }));
            return;
          }
          if (payload.control) controlApi.adopt(payload.control);
          await controlApi.refresh();
        } catch (err) {
          setError(t('error.controlUnavailable'));
        } finally {
          setPending('');
        }
      };

      return h('section', {
        style: {
          marginTop: 18,
          border: '1px solid ' + T.border,
          borderRadius: 14,
          background: T.bg,
          overflow: 'hidden',
        },
      },
        h('div', {
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, padding: '14px 18px', borderBottom: '1px solid ' + T.border,
            flexWrap: 'wrap',
          },
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
            h('span', { style: { fontSize: 14, fontWeight: 650, color: T.text } }, t('control.title')),
            control && control.dry_run === true ? h('span', {
              style: {
                fontSize: 10, fontWeight: 600, color: T.orange, border: '1px solid ' + T.border,
                background: T.soft, borderRadius: 5, padding: '1px 6px', letterSpacing: '.02em',
              },
            }, t('control.dryRunTag')) : null
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { style: { fontSize: 11, color: T.muted } }, t('control.status')),
            h(StatusPill, { tone: state.color, label: t(state.label) })
          )
        ),
        h('div', { style: { padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 } },
          !connected ? h('div', {
            role: 'alert',
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '10px 12px', borderRadius: 10, background: T.soft,
              border: '1px solid ' + T.border, color: T.red, fontSize: 12, lineHeight: 1.6,
            },
          },
            h('span', null, t('error.controlUnavailable')),
            h(Button, { variant: 'secondary', onClick: () => controlApi.refresh() }, t('control.retry'))
          ) : null,
          error ? h('div', {
            role: 'alert',
            style: {
              padding: '9px 12px', borderRadius: 10, background: T.soft,
              border: '1px solid ' + T.border, color: T.red, fontSize: 12, lineHeight: 1.6,
            },
          }, error) : null,
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
            h('label', {
              htmlFor: 'xwm-rounds',
              style: { fontSize: 12, color: T.secondary, fontWeight: 600 },
            }, t('control.rounds')),
            h('input', {
              id: 'xwm-rounds',
              type: 'number',
              min: 1,
              max: 10,
              step: 1,
              value: roundsText,
              disabled: running || !!pending,
              onChange: (event) => setRoundsText(event.target.value),
              onBlur: () => setRoundsText(String(clampRounds(roundsText))),
              'aria-label': t('control.rounds'),
              style: {
                width: 68, boxSizing: 'border-box', padding: '6px 8px', borderRadius: 8,
                border: '1px solid ' + T.borderStrong, background: T.bg, color: T.text,
                fontSize: 13, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums',
              },
            }),
            h('span', {
              style: {
                fontSize: 11, color: T.muted, padding: '3px 8px', borderRadius: 6,
                background: T.soft, border: '1px solid ' + T.border,
              },
            }, t('control.perRound')),
            h('div', { style: { flex: '1 1 12px' } }),
            h(Button, {
              variant: 'primary',
              disabled: !canStart,
              onClick: () => start(false),
            }, pending === 'run' ? t('control.starting') : t('control.start')),
            h(Button, {
              variant: 'secondary',
              disabled: !canStart,
              onClick: () => start(true),
            }, pending === 'dry' ? t('control.starting') : t('control.dryRun')),
            h(Button, {
              variant: 'stop',
              disabled: !canStop,
              onClick: stop,
            }, pending === 'stop' ? t('control.stopping') : t('control.stop'))
          ),
          h('div', { style: { fontSize: 11, color: T.muted, lineHeight: 1.6 } }, t('control.note')),
          h('div', {
            style: {
              display: 'grid', gap: 8,
              gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
            },
          },
            h(Stat, {
              label: t('control.round'),
              value: connect.round == null || connect.round === '' ? '—' : connect.round,
              suffix: running || (control && control.rounds) ? t('control.roundTotal', { total: control.rounds || 0 }) : null,
            }),
            h(Stat, { label: t('control.checked'), value: (connect.checked || 0) + ' / ' + PER_ROUND }),
            h(Stat, { label: t('control.follows'), value: connect.new_follows || 0 }),
            h(Stat, { label: t('control.likes'), value: connect.likes || 0 }),
            h(Stat, { label: t('control.replies'), value: connect.replies || 0 }),
            h(Stat, {
              label: t('control.exitCode'),
              value: control && control.exit_code != null ? control.exit_code : '—',
            })
          ),
          h('div', { style: { borderTop: '1px solid ' + T.border, paddingTop: 12 } },
            h('div', {
              style: {
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                gap: 12, marginBottom: 7,
              },
            },
              h('span', { style: { fontSize: 12, fontWeight: 650, color: T.text } }, t('control.log')),
              h('span', { style: { fontSize: 10, color: T.muted } }, t('control.logMeta', { count: 20 }))
            ),
            h('pre', {
              ref: logRef,
              style: {
                margin: 0, padding: '10px 12px', borderRadius: 10,
                background: T.soft, border: '1px solid ' + T.border,
                color: T.secondary, fontFamily: T.mono, fontSize: 11, lineHeight: 1.65,
                maxHeight: 220, minHeight: 72, overflow: 'auto',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              },
            }, logText || t('control.log.empty'))
          )
        )
      );
    }

    function Recent({ t, data }) {
      const tweets = (data && data.recent_tweets) || [];
      const candidates = (data && data.recent_candidates) || [];
      const listStyle = { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 };
      const itemStyle = {
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: T.text, fontSize: 12,
      };
      return h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } },
        h('div', { style: listStyle },
          h('div', { style: { color: T.muted, fontSize: 11 } }, t('recent.discoveries')),
          tweets.length ? tweets.map((x, i) => h('div', { key: i, style: itemStyle, title: x.text },
            `@${x.author} · ${x.text}`)) : h('div', { style: { ...itemStyle, color: T.muted } }, t('recent.empty'))
        ),
        h('div', { style: listStyle },
          h('div', { style: { color: T.muted, fontSize: 11 } }, t('recent.candidates')),
          candidates.length ? candidates.map((x, i) => h('div', { key: i, style: itemStyle },
            `@${x.handle} · ${x.status}${x.followers != null ? ' · ' + t('recent.followers', { count: x.followers }) : ''}`))
            : h('div', { style: { ...itemStyle, color: T.muted } }, t('recent.empty'))
        )
      );
    }

    function EmptyState({ t, error }) {
      return h('div', {
        style: {
          padding: '14px 16px', borderRadius: 10, border: '1px dashed ' + T.border,
          color: T.muted, fontSize: 12, lineHeight: 1.7, background: T.soft,
        },
      }, error ? t('recent.statusService') : t('page.hint.loading'));
    }

    function WorkflowPage({ t }) {
      const workflow = useWorkflowData();
      const controlApi = useControlStatus();
      const d = workflow.data;
      const s = summary(d);
      const tr = typeof t === 'function' ? t : (key) => key;
      const page = {
        padding: '36px 40px 60px', maxWidth: 1080, margin: '0 auto',
        color: T.text,
        fontFamily: 'var(--dsw-alias-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      };
      return h('div', { style: page },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
          h(Dot, { color: d ? T.green : T.orange }),
          h('h1', { style: { fontSize: 24, margin: 0, fontWeight: 650 } }, tr('page.title')),
          s.account ? h('span', { style: { color: T.muted, fontSize: 12 } }, '@' + s.account) : null
        ),
        h('div', { style: { color: T.muted, fontSize: 12, marginBottom: 22 } },
          workflow.loading ? tr('page.hint.loading') : d ? tr('page.hint.updated', { time: d.updated_at || '' }) : tr('page.hint.offline')
        ),
        d ? h(StatusRow, { t: tr, data: d }) : h(EmptyState, { t: tr, error: workflow.error }),
        h(ControlPanel, { t: tr, data: d, controlApi }),
        d ? h('div', {
          style: {
            marginTop: 18,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
            padding: 20, border: '1px solid ' + T.border, borderRadius: 14, background: T.bg,
          },
        }, h(Recent, { t: tr, data: d })) : null
      );
    }

    function PanelIcon({ size = 16 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true,
        style: { display: 'block' },
      },
        h('circle', { cx: 6, cy: 7, r: 2.2, fill: 'currentColor' }),
        h('circle', { cx: 18, cy: 7, r: 2.2, fill: 'currentColor', opacity: 0.65 }),
        h('circle', { cx: 12, cy: 17, r: 2.2, fill: 'currentColor', opacity: 0.85 }),
        h('path', { d: 'M8 8.5l8 0M7.5 9l3.8 6M16.5 9l-3.8 6', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' })
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'x-workflow-monitor: dictionaries');
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'x-workflow-monitor', order: 20,
          label: () => ctx.locale.bind(NS)('panel.label'),
          locale: NS,
        }, PanelIcon));
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'x-workflow-monitor', locale: NS,
        }, WorkflowPage));
      },
    };
  },
});
