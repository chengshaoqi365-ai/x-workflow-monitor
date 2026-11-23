window.__ModuleLoader__.load({
  id: '@local/x-workflow-monitor',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useState } = React;
    const ENDPOINT = 'http://127.0.0.1:8787/status';

    const T = {
      text: 'var(--dsw-alias-label-primary, #111827)',
      muted: 'var(--dsw-alias-label-tertiary, #6b7280)',
      border: 'var(--dsw-alias-border-l2, #e5e7eb)',
      bg: 'var(--dsw-alias-bg-layer-2, #ffffff)',
      soft: 'var(--dsw-alias-bg-layer-1, #f8fafc)',
      green: '#16a34a',
      red: '#dc2626',
      blue: '#2563eb',
      orange: '#d97706',
    };

    function Dot({ color }) {
      return h('span', {
        style: {
          display: 'inline-block', width: 8, height: 8, borderRadius: 99,
          background: color, boxShadow: `0 0 0 3px ${color}22`, flex: 'none',
        },
      });
    }

    function Chip({ label, value, color }) {
      return h('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 11px', borderRadius: 8, background: T.soft,
          border: `1px solid ${T.border}`, whiteSpace: 'nowrap',
        },
      },
        h(Dot, { color }),
        h('span', { style: { color: T.muted } }, label),
        h('strong', { style: { color: T.text, fontWeight: 600 } }, value)
      );
    }

    function useWorkflowData() {
      const [state, setState] = useState({ loading: true, data: null, error: '' });
      const load = useCallback(async () => {
        try {
          const res = await fetch(ENDPOINT, { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          setState({ loading: false, data, error: '' });
        } catch (err) {
          setState({ loading: false, data: null, error: String(err) });
        }
      }, []);
      useEffect(() => {
        let alive = true;
        const tick = async () => {
          try {
            const res = await fetch(ENDPOINT, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (alive) setState({ loading: false, data, error: '' });
          } catch (err) {
            if (alive) setState({ loading: false, data: null, error: String(err) });
          }
        };
        tick();
        const timer = setInterval(tick, 5000);
        return () => { alive = false; clearInterval(timer); };
      }, []);
      return { ...state, reload: load };
    }

    function summary(data) {
      const wf = data && data.workflow ? data.workflow : {};
      const actions = wf.actions || {};
      const cand = wf.candidates || {};
      const connect = wf.connect || {};
      return {
        clean: wf.chrome_clean === true,
        tweets: wf.tweets || 0,
        candidates: cand,
        actions,
        connect,
        connectSeen: wf.connect_seen || 0,
      };
    }

    function StatusRow({ data }) {
      const s = summary(data);
      return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 7 } },
        h(Chip, { label: '安全门', value: s.clean ? 'CLEAN' : '未确认', color: s.clean ? T.green : T.orange }),
        h(Chip, { label: 'Connect 发现', value: `${s.tweets} 条`, color: T.blue }),
        h(Chip, { label: '本轮检查', value: `${s.connect.checked || 0}/30 · 已见 ${s.connectSeen}`, color: T.blue }),
        h(Chip, { label: '本轮动作', value: `关 ${s.connect.new_follows || 0} · 赞 ${s.connect.likes || 0} · 回 ${s.connect.replies || 0}`, color: T.green }),
        h(Chip, { label: '今日动作', value: `赞 ${s.actions.like || 0} · 回 ${s.actions.reply || 0} · 关 ${s.actions.follow || 0}`, color: T.green })
      );
    }

    function Recent({ data }) {
      const tweets = (data && data.recent_tweets) || [];
      const candidates = (data && data.recent_candidates) || [];
      const listStyle = { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 };
      const itemStyle = {
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: T.text, fontSize: 12,
      };
      return h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } },
        h('div', { style: listStyle },
          h('div', { style: { color: T.muted, fontSize: 11 } }, '最近发现'),
          tweets.length ? tweets.map((x, i) => h('div', { key: i, style: itemStyle, title: x.text },
            `@${x.author} · ${x.text}`)) : h('div', { style: { ...itemStyle, color: T.muted } }, '暂无记录')
        ),
        h('div', { style: listStyle },
          h('div', { style: { color: T.muted, fontSize: 11 } }, '最近候选人'),
          candidates.length ? candidates.map((x, i) => h('div', { key: i, style: itemStyle },
            `@${x.handle} · ${x.status}${x.followers != null ? ' · ' + x.followers + ' 粉丝' : ''}`))
            : h('div', { style: { ...itemStyle, color: T.muted } }, '暂无记录')
        )
      );
    }

    function EmptyState({ error }) {
      return h('div', {
        style: {
          padding: '14px 16px', borderRadius: 10, border: `1px dashed ${T.border}`,
          color: T.muted, fontSize: 12, lineHeight: 1.7, background: T.soft,
        },
      },
        error ? '状态服务未连接。在 x-desktop-auto 目录运行：python3 scripts/status_server.py' : '正在读取状态…'
      );
    }

    function WorkflowPage() {
      const state = useWorkflowData();
      const d = state.data;
      const page = {
        padding: '36px 40px 60px', maxWidth: 1080, margin: '0 auto',
        color: T.text, fontFamily: 'var(--dsw-alias-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      };
      return h('div', { style: page },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
          h(Dot, { color: d ? T.green : T.orange }),
          h('h1', { style: { fontSize: 24, margin: 0, fontWeight: 650 } }, 'X 自动化工作流'),
          h('span', { style: { color: T.muted, fontSize: 12 } }, '@Veylon_lg')
        ),
        h('div', { style: { color: T.muted, fontSize: 12, marginBottom: 22 } },
          state.loading ? '正在连接状态服务…' : d ? `状态更新时间 ${d.updated_at || ''}` : '状态服务未启动'),
        d ? h(React.Fragment, null,
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 } }, h(StatusRow, { data: d })),
          h('div', {
            style: {
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
              padding: 20, border: `1px solid ${T.border}`, borderRadius: 14, background: T.bg,
            },
          }, h(Recent, { data: d }))
        ) : h(EmptyState, { error: state.error })
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
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'x-workflow-monitor', order: 20, label: 'X 工作流',
        }, PanelIcon));
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'x-workflow-monitor',
        }, WorkflowPage));
      },
    };
  },
});
