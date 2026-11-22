window.__ModuleLoader__.load({
  id: '@local/x-workflow-monitor',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useEffect, useState } = React;
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
          display: 'inline-block', width: 7, height: 7, borderRadius: 99,
          background: color, boxShadow: `0 0 0 3px ${color}22`,
        },
      });
    }

    function Chip({ label, value, color }) {
      return h('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 9px', borderRadius: 7, background: T.soft,
          border: `1px solid ${T.border}`, whiteSpace: 'nowrap',
        },
      },
        h(Dot, { color }),
        h('span', { style: { color: T.muted } }, label),
        h('strong', { style: { color: T.text, fontWeight: 600 } }, value)
      );
    }

    function MiniList({ title, rows, empty }) {
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
        h('div', { style: { color: T.muted, fontSize: 11 } }, title),
        rows && rows.length
          ? rows.map((r, i) => h('div', {
              key: i,
              title: r.detail || r.text || '',
              style: {
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: T.text, fontSize: 11.5,
              },
            }, r.label))
          : h('div', { style: { color: T.muted, fontSize: 11.5 } }, empty)
      );
    }

    function WorkflowMonitor() {
      const [state, setState] = useState({ loading: true, data: null, error: '' });

      useEffect(() => {
        let alive = true;
        let timer = null;
        const load = async () => {
          try {
            const res = await fetch(ENDPOINT, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (alive) setState({ loading: false, data, error: '' });
          } catch (err) {
            if (alive) setState({ loading: false, data: null, error: String(err) });
          }
        };
        load();
        timer = setInterval(load, 5000);
        return () => { alive = false; if (timer) clearInterval(timer); };
      }, []);

      const d = state.data;
      const wf = d && d.workflow ? d.workflow : {};
      const actions = wf.actions || {};
      const cand = wf.candidates || {};
      const tweets = wf.tweets || 0;
      const clean = wf.chrome_clean === true;
      const hasData = !!d;

      const chips = [
        { label: '安全门', value: clean ? 'CLEAN' : '未确认', color: clean ? T.green : T.orange },
        { label: 'Connect 发现', value: `${tweets} 条`, color: T.blue },
        { label: '候选人', value: `new ${cand.new || 0} / skipped ${cand.skipped || 0}`, color: T.blue },
        { label: '今日动作', value: `赞 ${actions.like || 0} · 回 ${actions.reply || 0} · 关 ${actions.follow || 0}`, color: T.green },
      ];

      const tweetRows = (d && d.recent_tweets ? d.recent_tweets : []).map((x) => ({
        label: `@${x.author} · ${x.text}`,
        detail: x.text,
      }));
      const candRows = (d && d.recent_candidates ? d.recent_candidates : []).map((x) => ({
        label: `@${x.handle} · ${x.status}${x.followers != null ? ' · ' + x.followers + ' 粉丝' : ''}`,
      }));

      return h('div', {
        role: 'status',
        'aria-live': 'polite',
        style: {
          margin: '4px 0 2px', padding: '10px 14px', borderRadius: 12,
          border: `1px solid ${T.border}`, background: T.bg, color: T.text,
          fontFamily: 'var(--dsw-alias-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
          fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8,
        },
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Dot, { color: hasData ? T.green : T.orange }),
          h('strong', { style: { fontSize: 12.5 } }, 'X 自动化工作流'),
          h('span', { style: { color: T.muted, fontSize: 11 } },
            state.loading ? '连接状态服务…' : hasData ? `更新 ${d.updated_at || ''}` : '状态服务未启动'),
          h('span', { style: { flex: 1 } }),
          h('span', { style: { color: T.muted, fontSize: 11 } }, '@Veylon_lg')
        ),
        !hasData
          ? h('div', { style: { color: T.muted, fontSize: 11.5, lineHeight: 1.6 } },
              state.error ? '状态服务未连接。在 x-desktop-auto 目录运行：python3 scripts/status_server.py' : '正在读取状态…')
          : h(React.Fragment, null,
              h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, chips.map((x, i) => h(Chip, { key: i, ...x }))),
              h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
                h(MiniList, { title: '最近发现', rows: tweetRows, empty: '暂无记录' }),
                h(MiniList, { title: '最近候选人', rows: candRows, empty: '暂无记录' })
              )
            )
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'x-workflow-monitor',
          order: 50,
        }, WorkflowMonitor));
      },
    };
  },
});
