window.__ModuleLoader__.load({
  id: '@local/x-workflow-monitor',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    const NS = 'xWorkflowMonitor';
    const STATUS_V2_ENDPOINT = 'http://127.0.0.1:8787/status/v2';
    const STATUS_ENDPOINT = 'http://127.0.0.1:8787/status';
    const ACTIONS_ENDPOINT = 'http://127.0.0.1:8787/actions';
    const RUNS_ENDPOINT = 'http://127.0.0.1:8787/runs';
    const PENDING_ENDPOINT = 'http://127.0.0.1:8787/pending';
    const CONTROL_STATUS_ENDPOINT = 'http://127.0.0.1:8788/control/status';
    const CONTROL_RUN_ENDPOINT = 'http://127.0.0.1:8788/control/run';
    const CONTROL_STOP_ENDPOINT = 'http://127.0.0.1:8788/control/stop';
    const SERVICE_START_ENDPOINT = 'api/x-workflow-monitor/services/start';
    const PER_ROUND = 30;
    const CONTROL_POLL_MS = 2000;
    const STATUS_POLL_MS = 5000;
    const OPTIONAL_POLL_MS = 30000;
    const DEFAULT_TABLE_ROWS = 10;

    // ---------------------------------------------------------------------
    // Copy (zh is the product language; en keeps the plugin translatable)
    // ---------------------------------------------------------------------
    const zh = {
      'panel.label': 'X 工作流',
      'page.title': 'X 自动化工作流',
      'page.loading': '正在连接状态服务…',
      'page.updated': '状态更新时间 {time}',
      'page.updatedAge': '状态更新时间 {time} · 数据延迟 {age} 秒',
      'page.offline': '状态服务未连接',
      'page.sourceV2': '数据源 /status/v2',
      'page.sourceLegacy': '兼容模式（/status）',
      'page.todaySummary': '今日 关注 {follow} · 点赞 {like} · 回复 {reply}',

      'status.running': '运行中',
      'status.completed': '已完成',
      'status.stopped': '已停止',
      'status.failed': '失败',
      'status.idle': '未运行',
      'status.disconnected': '控制服务未连接',

      'header.runningLine': '本次第 {index}/{total} 轮 · {checked}/{max} · 已运行 {elapsed} · {eta}',
      'header.roundLine': '本次第 {index}/{total} 轮 · {checked}/{max} · 已运行 {elapsed}',
      'header.eta': '预计剩余 {duration}',
      'header.etaPending': '预计时间计算中',
      'header.lastRun': '上次运行 {start}–{end} · 耗时 {duration}',
      'header.noRun': '还没有运行记录',
      'header.stopReason': '停止原因：{reason}',
      'header.controlDown': '控制服务未连接，暂时不能开始或停止任务',

      'button.settings': '运行设置',
      'button.start': '开始运行',
      'button.dryRun': 'dry-run',
      'button.stop': '停止',
      'button.starting': '启动中…',
      'button.stopping': '停止中…',
      'button.close': '关闭',
      'button.done': '完成',
      'button.viewAll': '查看全部',
      'button.copy': '复制 @{handle}',
      'button.copied': '已复制',
      'button.collapse': '收起',
      'button.download': '下载',
      'button.openSettings': '修改',

      'error.controlUnavailable': '控制服务未启动，请在 x-desktop-auto 运行 bash scripts/start_control_server.sh',
      'services.title': '服务管理',
      'services.status': '状态服务',
      'services.control': '控制服务',
      'services.checking': '{service}检测中',
      'services.running': '{service}运行中',
      'services.offline': '{service}未运行',
      'services.start': '启动服务',
      'services.startStatus': '启动状态服务',
      'services.startControl': '启动控制服务',
      'services.failed': '服务启动失败：{detail}',
      'services.unreachable': '{service}已就绪，页面仍无法连接',
      'error.alreadyRunning': '已有任务在运行',
      'error.startFailed': '启动失败：{detail}',
      'error.stopFailed': '停止失败：{detail}',
      'error.notRunning': '当前没有运行中的任务',
      'error.noClipboard': '浏览器不允许访问剪贴板',

      'progress.checked': '{checked}/{max}',
      'progress.percent': '{percent}%',
      'progress.current': '当前 @{handle}',
      'progress.stage': '{stage}',
      'progress.waiting': '等待下一个目标',
      'progress.noTarget': '暂无当前目标',
      'progress.lastEvent': '最后事件',
      'progress.lastEventLine': '最后事件：{text}',
      'progress.metric.checked': '已检查',
      'progress.metric.follow': '关注',
      'progress.metric.like': '点赞',
      'progress.metric.reply': '回复',
      'progress.metric.failed': '失败',
      'progress.metric.skipped': '跳过',

      'stage.search': '搜索',
      'stage.hover': '悬停',
      'stage.follow': '关注',
      'stage.like': '点赞',
      'stage.reply': '回复',
      'stage.cooldown': '休息',
      'stage.running': '执行中',

      'table.title': '本轮目标',
      'table.meta': '共 {total} 行 · 默认显示最近 {shown} 行',
      'table.metaAll': '共 {total} 行',
      'table.filterAll': '全部',
      'table.filterFailed': '只看失败',
      'table.empty.actions': '本轮还没有动作记录',
      'table.empty.log': '运行日志中还没有目标记录',
      'table.empty.none': '逐目标明细接口尚未接入（GET /actions）',
      'table.empty.noneHint': '接口就绪后，这里会显示每个目标的关注、点赞、回复结果。',
      'table.empty.filtered': '没有符合条件的行',
      'table.logHint': '逐目标接口未接入，以下内容由运行日志推断，仅显示可确认的信息。',
      'table.allTitle': '本轮全部目标（{total}）',
      'table.col.index': '#',
      'table.col.account': '账号',
      'table.col.follow': '关注',
      'table.col.like': '点赞',
      'table.col.reply': '回复',
      'table.col.result': '结果',
      'table.col.time': '时间',
      'table.result.ok': '完成',
      'table.result.failed': '失败',
      'table.result.skipped': '跳过',
      'table.result.running': '进行中',
      'table.result.unknown': '—',
      'table.detail.tweet': '推文摘要',
      'table.detail.reply': '回复原文',
      'table.detail.error': '失败详情',
      'table.detail.attempt': '尝试次数',
      'table.detail.time': '时间',
      'table.detail.none': '暂无',

      'pending.title': '需要处理',
      'pending.failed': '失败 {count}',
      'pending.never': '已关注未回复 {count}',
      'pending.empty': '没有待处理项',
      'pending.unavailable': '待处理明细接口尚未接入（GET /pending）',
      'pending.countOnly': '待处理 {count} 项，明细接口尚未接入',
      'pending.state.failed': '失败',
      'pending.state.never_attempted': '未尝试',
      'pending.attempts': '尝试 {count} 次',
      'pending.followedAt': '关注于 {time}',

      'run.title': '本次运行',
      'run.mode': '模式',
      'run.mode.execute': '真实执行',
      'run.mode.dry': 'dry-run',
      'run.rounds': '计划轮数',
      'run.modeRounds': '{mode} · {rounds} 轮',
      'run.timeRange': '{start}–{end} · {duration}',
      'run.checkedExit': '{checked}/{max} · 退出码 {code}',
      'run.time': '时间',
      'run.started': '开始',
      'run.ended': '结束',
      'run.duration': '耗时',
      'run.checked': '已检查',
      'run.exitCode': '退出码',
      'run.stopReason': '停止原因',
      'run.runId': '运行 ID',
      'run.empty': '控制服务未连接，暂无运行信息',
      'run.notEnded': '进行中',

      'safety.title': '安全与节奏',
      'safety.browser': '浏览器',
      'safety.clean': 'CLEAN',
      'safety.unchecked': '未检测',
      'safety.abnormal': '异常',
      'safety.alerts': '平台告警',
      'safety.alertsUnknown': '未监测',
      'safety.egress': '出口',
      'safety.egressUnchecked': '未检测',
      'safety.timezone': '账号时区',
      'safety.timezoneUnknown': '未接入',
      'safety.today': '今日动作',
      'safety.todayHint': '按账号时区统计，仅计数',
      'safety.todayHintLegacy': '服务端统计，失败/跳过未接入',
      'safety.today.follow': '关注',
      'safety.today.like': '点赞',
      'safety.today.reply': '回复',
      'safety.today.failed': '失败',
      'safety.today.skipped': '跳过',

      'history.title': '运行历史',
      'history.subtitle': '最近 10 次真实运行（不含 dry-run）',
      'history.unavailable': '运行历史接口尚未接入（GET /runs）',
      'history.empty': '还没有运行记录',
      'history.col.start': '开始',
      'history.col.mode': '模式',
      'history.col.rounds': '轮数',
      'history.col.checked': '检查',
      'history.col.actions': '关注 / 点赞 / 回复',
      'history.col.failed': '失败',
      'history.col.result': '结果',
      'history.col.stop': '停止原因',

      'audit.title': '回复审计',
      'audit.subtitle': '回复原文与字数，用于检查质量和重复率',
      'audit.unavailable': '回复明细接口尚未接入（GET /actions）',
      'audit.empty': '还没有回复记录',
      'audit.col.time': '时间',
      'audit.col.account': '账号',
      'audit.col.text': '回复原文',
      'audit.col.chars': '字数',
      'audit.col.status': '状态',

      'logs.title': '原始日志',
      'logs.subtitle': '默认折叠 · 支持自动跟随、只看错误、搜索和下载',
      'logs.autoFollow': '自动跟随',
      'logs.errorsOnly': '只看错误',
      'logs.search': '搜索日志',
      'logs.download': '下载日志',
      'logs.empty': '暂无日志',
      'logs.lines': '显示 {shown}/{total} 行',
      'logs.tailNote': '控制服务当前只保留最近 {count} 行日志；接口扩展后可保留 200 行以上。',

      'settings.title': '运行设置',
      'settings.rounds': '轮数',
      'settings.roundsHint': '1–10 轮，默认 3 轮',
      'settings.perRound': '每轮 {count} 个 id',
      'settings.maxNewFollows': '本次新关注数量',
      'settings.maxNewFollowsHint': '0 表示不限制',
      'settings.note': '开始运行会真实执行关注、点赞与回复；dry-run 只读取页面，不点击任何按钮，也不写入运行历史。',
      'settings.summary': '当前：{rounds} 轮 · 每轮 {perRound} 个 id · 新关注 {maxNewFollows}',
      'settings.invalidRounds': '轮数需为 1–10 的整数',
      'settings.invalidFollows': '新关注数量需为 0–100 的整数',

      'toast.started': '已启动真实运行',
      'toast.dryStarted': '已启动 dry-run',
      'toast.stopped': '已发送停止请求',
      'toast.copied': '已复制 @{handle}',

      'event.checking': '检查 @{handle}',
      'event.chromeClean': '安全检查通过：主 Chrome 进程无自动化/调试参数',
      'event.permissionOk': '辅助功能权限正常',
      'event.stoppedNoRetry': '已停止，不重试',
      'event.stage': '{name}',
      'stop.followFailed': '关注失败：{detail}',
      'stop.likeFailed': '点赞失败：{detail}',
      'stop.replyFailed': '回复失败：{detail}',
      'stop.failed': '运行失败：{detail}',
      'stop.userStopped': '已手动停止',
      'stop.roundsDone': '已完成计划轮数',
      'stop.completed': '已完成',

      'err.still_open': '回复框未关闭（still_open）',
      'err.text_mismatch': '输入内容不一致（text_mismatch）',
      'err.follow_not_confirmed': '未确认成功（follow_not_confirmed）',
      'err.reply_not_confirmed': '未确认回复成功（reply_not_confirmed）',
      'err.hover_failed': '悬停失败（hover_failed）',
      'err.reply_not_sent': '回复未发出（reply_not_sent）',
      'err.timeout': '操作超时（timeout）',
      'err.not_found': '未找到目标（not_found）',
      'err.no_reply_button': '未找到回复入口（no_reply_button）',

      'common.none': '—',
      'common.na': '暂无',
      'common.unknown': '未知',
    };

    const en = {
      'panel.label': 'X Workflow',
      'page.title': 'X automation workflow',
      'page.loading': 'Connecting to the status service…',
      'page.updated': 'Status updated at {time}',
      'page.updatedAge': 'Status updated at {time} · data age {age}s',
      'page.offline': 'Status service is not connected',
      'page.sourceV2': 'Source /status/v2',
      'page.sourceLegacy': 'Compatibility mode (/status)',
      'page.todaySummary': 'Today: follow {follow} · like {like} · reply {reply}',

      'status.running': 'Running',
      'status.completed': 'Completed',
      'status.stopped': 'Stopped',
      'status.failed': 'Failed',
      'status.idle': 'Idle',
      'status.disconnected': 'Control service offline',

      'header.runningLine': 'Round {index}/{total} · {checked}/{max} · running {elapsed} · {eta}',
      'header.roundLine': 'Round {index}/{total} · {checked}/{max} · ran {elapsed}',
      'header.eta': '{duration} remaining',
      'header.etaPending': 'estimating remaining time',
      'header.lastRun': 'Last run {start}–{end} · took {duration}',
      'header.noRun': 'No runs yet',
      'header.stopReason': 'Stop reason: {reason}',
      'header.controlDown': 'Control service is offline; start and stop are unavailable',

      'button.settings': 'Run settings',
      'button.start': 'Start run',
      'button.dryRun': 'dry-run',
      'button.stop': 'Stop',
      'button.starting': 'Starting…',
      'button.stopping': 'Stopping…',
      'button.close': 'Close',
      'button.done': 'Done',
      'button.viewAll': 'View all',
      'button.copy': 'Copy @{handle}',
      'button.copied': 'Copied',
      'button.collapse': 'Collapse',
      'button.download': 'Download',
      'button.openSettings': 'Change',

      'error.controlUnavailable': 'Control service is not running. In x-desktop-auto run bash scripts/start_control_server.sh',
      'services.title': 'Service management',
      'services.status': 'Status service',
      'services.control': 'Control service',
      'services.checking': 'Checking {service}',
      'services.running': '{service} running',
      'services.offline': '{service} stopped',
      'services.start': 'Start services',
      'services.startStatus': 'Start status service',
      'services.startControl': 'Start control service',
      'services.failed': 'Service startup failed: {detail}',
      'services.unreachable': '{service} is ready, but this page cannot connect',
      'error.alreadyRunning': 'A task is already running',
      'error.startFailed': 'Failed to start: {detail}',
      'error.stopFailed': 'Failed to stop: {detail}',
      'error.notRunning': 'There is no running task',
      'error.noClipboard': 'The browser blocked clipboard access',

      'progress.checked': '{checked}/{max}',
      'progress.percent': '{percent}%',
      'progress.current': 'Current @{handle}',
      'progress.stage': '{stage}',
      'progress.waiting': 'Waiting for the next target',
      'progress.noTarget': 'No current target',
      'progress.lastEvent': 'Last event',
      'progress.lastEventLine': 'Last event: {text}',
      'progress.metric.checked': 'Checked',
      'progress.metric.follow': 'Follow',
      'progress.metric.like': 'Like',
      'progress.metric.reply': 'Reply',
      'progress.metric.failed': 'Failed',
      'progress.metric.skipped': 'Skipped',

      'stage.search': 'Search',
      'stage.hover': 'Hover',
      'stage.follow': 'Follow',
      'stage.like': 'Like',
      'stage.reply': 'Reply',
      'stage.cooldown': 'Cooldown',
      'stage.running': 'Running',

      'table.title': 'Targets this round',
      'table.meta': '{total} rows · showing latest {shown}',
      'table.metaAll': '{total} rows',
      'table.filterAll': 'All',
      'table.filterFailed': 'Failed only',
      'table.empty.actions': 'No action records for this round yet',
      'table.empty.log': 'No targets in the run log yet',
      'table.empty.none': 'Per-target detail API is not connected yet (GET /actions)',
      'table.empty.noneHint': 'Once available, each target’s follow, like and reply result appears here.',
      'table.empty.filtered': 'No matching rows',
      'table.logHint': 'Per-target API is not connected; rows below are inferred from the run log and show confirmed data only.',
      'table.allTitle': 'All targets this round ({total})',
      'table.col.index': '#',
      'table.col.account': 'Account',
      'table.col.follow': 'Follow',
      'table.col.like': 'Like',
      'table.col.reply': 'Reply',
      'table.col.result': 'Result',
      'table.col.time': 'Time',
      'table.result.ok': 'Done',
      'table.result.failed': 'Failed',
      'table.result.skipped': 'Skipped',
      'table.result.running': 'Running',
      'table.result.unknown': '—',
      'table.detail.tweet': 'Post excerpt',
      'table.detail.reply': 'Reply text',
      'table.detail.error': 'Failure detail',
      'table.detail.attempt': 'Attempts',
      'table.detail.time': 'Time',
      'table.detail.none': 'None',

      'pending.title': 'Needs attention',
      'pending.failed': 'Failed {count}',
      'pending.never': 'Followed, no reply {count}',
      'pending.empty': 'Nothing pending',
      'pending.unavailable': 'Pending detail API is not connected yet (GET /pending)',
      'pending.countOnly': '{count} pending; detail API is not connected',
      'pending.state.failed': 'Failed',
      'pending.state.never_attempted': 'Not attempted',
      'pending.attempts': '{count} attempt(s)',
      'pending.followedAt': 'Followed at {time}',

      'run.title': 'This run',
      'run.mode': 'Mode',
      'run.mode.execute': 'Live',
      'run.mode.dry': 'dry-run',
      'run.rounds': 'Planned rounds',
      'run.modeRounds': '{mode} · {rounds} rounds',
      'run.timeRange': '{start}–{end} · {duration}',
      'run.checkedExit': '{checked}/{max} · exit {code}',
      'run.time': 'Time',
      'run.started': 'Started',
      'run.ended': 'Ended',
      'run.duration': 'Duration',
      'run.checked': 'Checked',
      'run.exitCode': 'Exit code',
      'run.stopReason': 'Stop reason',
      'run.runId': 'Run ID',
      'run.empty': 'Control service is offline; no run information',
      'run.notEnded': 'running',

      'safety.title': 'Safety & pacing',
      'safety.browser': 'Browser',
      'safety.clean': 'CLEAN',
      'safety.unchecked': 'Not checked',
      'safety.abnormal': 'Abnormal',
      'safety.alerts': 'Platform alerts',
      'safety.alertsUnknown': 'Not monitored',
      'safety.egress': 'Egress',
      'safety.egressUnchecked': 'Not checked',
      'safety.timezone': 'Account time zone',
      'safety.timezoneUnknown': 'Not connected',
      'safety.today': 'Today',
      'safety.todayHint': 'Counted in the account time zone',
      'safety.todayHintLegacy': 'Server-side counts; failed/skipped not connected',
      'safety.today.follow': 'Follow',
      'safety.today.like': 'Like',
      'safety.today.reply': 'Reply',
      'safety.today.failed': 'Failed',
      'safety.today.skipped': 'Skipped',

      'history.title': 'Run history',
      'history.subtitle': 'Latest 10 live runs (dry-run excluded)',
      'history.unavailable': 'Run history API is not connected yet (GET /runs)',
      'history.empty': 'No runs yet',
      'history.col.start': 'Start',
      'history.col.mode': 'Mode',
      'history.col.rounds': 'Rounds',
      'history.col.checked': 'Checked',
      'history.col.actions': 'Follow / Like / Reply',
      'history.col.failed': 'Failed',
      'history.col.result': 'Result',
      'history.col.stop': 'Stop reason',

      'audit.title': 'Reply audit',
      'audit.subtitle': 'Reply text and length, for quality and repetition checks',
      'audit.unavailable': 'Reply detail API is not connected yet (GET /actions)',
      'audit.empty': 'No replies yet',
      'audit.col.time': 'Time',
      'audit.col.account': 'Account',
      'audit.col.text': 'Reply text',
      'audit.col.chars': 'Chars',
      'audit.col.status': 'Status',

      'logs.title': 'Raw log',
      'logs.subtitle': 'Collapsed by default · auto-follow, errors only, search and download',
      'logs.autoFollow': 'Auto-follow',
      'logs.errorsOnly': 'Errors only',
      'logs.search': 'Search log',
      'logs.download': 'Download log',
      'logs.empty': 'No log yet',
      'logs.lines': 'Showing {shown}/{total} lines',
      'logs.tailNote': 'The control service keeps only the latest {count} lines; the API can expose 200+ lines later.',

      'settings.title': 'Run settings',
      'settings.rounds': 'Rounds',
      'settings.roundsHint': '1–10 rounds, default 3',
      'settings.perRound': '{count} ids per round',
      'settings.maxNewFollows': 'New follows this run',
      'settings.maxNewFollowsHint': '0 means unlimited',
      'settings.note': 'Start run performs real follows, likes and replies; dry-run only reads pages without clicking and is not written to run history.',
      'settings.summary': 'Now: {rounds} rounds · {perRound} ids per round · new follows {maxNewFollows}',
      'settings.invalidRounds': 'Rounds must be an integer from 1 to 10',
      'settings.invalidFollows': 'New follows must be an integer from 0 to 100',

      'toast.started': 'Live run started',
      'toast.dryStarted': 'dry-run started',
      'toast.stopped': 'Stop requested',
      'toast.copied': 'Copied @{handle}',

      'event.checking': 'Checking @{handle}',
      'event.chromeClean': 'Safety check passed: the main Chrome process has no automation/debug flags',
      'event.permissionOk': 'Accessibility permission is OK',
      'event.stoppedNoRetry': 'Stopped, no retry',
      'event.stage': '{name}',
      'stop.followFailed': 'Follow failed: {detail}',
      'stop.likeFailed': 'Like failed: {detail}',
      'stop.replyFailed': 'Reply failed: {detail}',
      'stop.failed': 'Run failed: {detail}',
      'stop.userStopped': 'Stopped by user',
      'stop.roundsDone': 'Planned rounds completed',
      'stop.completed': 'Completed',

      'err.still_open': 'reply box stayed open (still_open)',
      'err.text_mismatch': 'typed text differed (text_mismatch)',
      'err.follow_not_confirmed': 'follow not confirmed (follow_not_confirmed)',
      'err.reply_not_confirmed': 'reply not confirmed (reply_not_confirmed)',
      'err.hover_failed': 'hover failed (hover_failed)',
      'err.reply_not_sent': 'reply not sent (reply_not_sent)',
      'err.timeout': 'operation timed out (timeout)',
      'err.not_found': 'target not found (not_found)',
      'err.no_reply_button': 'reply entry not found (no_reply_button)',

      'common.none': '—',
      'common.na': 'N/A',
      'common.unknown': 'Unknown',
    };

    // ---------------------------------------------------------------------
    // Style tokens and CSS. All colors come from the DSH theme tokens.
    // ---------------------------------------------------------------------
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

    const CSS = `
.xwm-page{display:flex;flex-direction:column;height:100%;min-height:0;flex:1 1 0;box-sizing:border-box;overflow:hidden;color:${T.text};font-family:var(--dsw-alias-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);background:${T.bg}}
.xwm-page *{box-sizing:border-box}
.xwm-topbar{flex:none;padding:18px clamp(16px,3vw,40px) 12px;border-bottom:1px solid ${T.border};background:${T.bg}}
.xwm-topbar-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.xwm-title-block{min-width:0}
.xwm-title-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0}
.xwm-title{font-size:22px;line-height:1.3;margin:0;font-weight:650;letter-spacing:-.01em}
.xwm-account{font-size:13px;color:${T.muted};white-space:nowrap}
.xwm-subtitle{margin-top:7px;font-size:12px;line-height:1.6;color:${T.secondary};min-height:19px}
.xwm-meta{margin-top:4px;font-size:11px;line-height:1.6;color:${T.muted}}
.xwm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:2px}
.xwm-scroll{flex:1 1 0;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable}
.xwm-scroll::-webkit-scrollbar{width:10px}
.xwm-scroll::-webkit-scrollbar-thumb{background:${T.borderStrong};border-radius:999px;border:2px solid transparent;background-clip:padding-box}
.xwm-scroll::-webkit-scrollbar-thumb:hover{background:${T.muted};background-clip:padding-box}
.xwm-scroll::-webkit-scrollbar-track{background:transparent}
.xwm-content{max-width:1240px;margin:0 auto;padding:14px clamp(16px,3vw,40px) 32px}
.xwm-status-wrap{position:sticky;top:0;z-index:3;padding:2px 0 10px;background:${T.bg}}
.xwm-card{border:1px solid ${T.border};border-radius:14px;background:${T.bg};overflow:hidden}
.xwm-card+.xwm-card{margin-top:14px}
.xwm-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;border-bottom:1px solid ${T.border};flex-wrap:wrap}
.xwm-card-title{font-size:14px;font-weight:650;color:${T.text};display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.xwm-card-sub{font-size:11px;font-weight:400;color:${T.muted}}
.xwm-card-body{padding:14px 16px}
.xwm-btn{appearance:none;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;line-height:1.35;font-family:inherit;cursor:pointer;white-space:nowrap;transition:filter .15s ease,background-color .15s ease}
.xwm-btn:disabled{cursor:not-allowed;opacity:.45}
.xwm-btn:not(:disabled):hover{filter:brightness(.95)}
.xwm-btn-primary{background:${T.blue};color:${T.onColor};border:1px solid ${T.blue}}
.xwm-btn-secondary{background:${T.bg};color:${T.text};border:1px solid ${T.borderStrong}}
.xwm-btn-danger{background:transparent;color:${T.red};border:1px solid ${T.borderStrong}}
.xwm-btn-ghost{background:transparent;color:${T.secondary};border:1px solid transparent;padding:6px 9px}
.xwm-btn-small{padding:4px 9px;font-size:11px;border-radius:6px}
.xwm-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:650;white-space:nowrap;border:1px solid ${T.border};background:${T.soft}}
.xwm-pill-dot{width:7px;height:7px;border-radius:999px;flex:none}
.xwm-pill-running{color:${T.blue}}
.xwm-pill-completed{color:${T.green}}
.xwm-pill-stopped{color:${T.orange}}
.xwm-pill-failed,.xwm-pill-disconnected{color:${T.red}}
.xwm-pill-idle{color:${T.muted}}
.xwm-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border-radius:10px;border:1px solid ${T.border};background:${T.soft};color:${T.red};font-size:12px;line-height:1.6;margin-bottom:12px;flex-wrap:wrap}
.xwm-services{padding:9px 12px;margin-top:10px;border:1px solid ${T.border};border-radius:10px;background:${T.soft};font-size:12px;line-height:1.6}
.xwm-services-row,.xwm-service-states{display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap}
.xwm-services-row{justify-content:space-between}
.xwm-service-state{display:inline-flex;align-items:center;gap:6px;color:${T.secondary}}
.xwm-service-error{margin:6px 0 0;color:${T.red};overflow-wrap:anywhere}
.xwm-progress-card{border:1px solid ${T.border};border-radius:14px;background:${T.bg};padding:13px 16px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.xwm-progress-top{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.xwm-progress-numbers{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.xwm-progress-pct{font-size:12px;color:${T.muted};margin-left:6px;font-weight:500}
.xwm-progress-line{margin-top:4px;font-size:12px;color:${T.secondary};display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.xwm-progress-line strong{color:${T.text};font-weight:650}
.xwm-progress-track{height:8px;border-radius:999px;background:${T.soft};border:1px solid ${T.border};overflow:hidden;margin:9px 0 10px}
.xwm-progress-fill{height:100%;border-radius:999px;background:${T.blue};transition:width .35s ease;min-width:0}
.xwm-progress-fill.is-failed{background:${T.red}}
.xwm-progress-fill.is-done{background:${T.green}}
.xwm-progress-fill.is-stopped{background:${T.orange}}
.xwm-event{font-size:11px;line-height:1.55;color:${T.muted};display:flex;gap:7px;align-items:baseline;min-width:0}
.xwm-event-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.xwm-event-dot{width:6px;height:6px;border-radius:999px;background:${T.borderStrong};flex:none;transform:translateY(-1px)}
.xwm-event-dot.is-error{background:${T.red}}
.xwm-metrics{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:10px}
.xwm-metric{padding:7px 9px;border:1px solid ${T.border};border-radius:9px;background:${T.soft};min-width:0}
.xwm-metric-label{display:block;font-size:10px;color:${T.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.xwm-metric-value{display:block;font-size:15px;font-weight:650;color:${T.text};font-variant-numeric:tabular-nums;line-height:1.35;margin-top:1px}
.xwm-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(290px,1fr);gap:14px;align-items:start;margin-top:14px}
.xwm-col{min-width:0}
.xwm-col>*+*{margin-top:14px}
.xwm-table-wrap{overflow:visible}
.xwm-table-head,.xwm-trow{display:grid;grid-template-columns:42px minmax(120px,1.6fr) 62px 62px 62px 84px 72px;gap:8px;align-items:center;padding:0 12px}
.xwm-table-head{position:sticky;top:0;z-index:1;height:34px;background:${T.soft};border-bottom:1px solid ${T.border};font-size:11px;color:${T.muted};font-weight:600}
.xwm-trow{min-height:40px;border-bottom:1px solid ${T.border};font-size:12px;color:${T.text};cursor:pointer;outline:none}
.xwm-trow:last-child{border-bottom:none}
.xwm-trow:hover{background:${T.soft}}
.xwm-trow:focus-visible{box-shadow:inset 0 0 0 2px ${T.blue}}
.xwm-trow.is-failed{background:color-mix(in srgb,${T.red} 8%,transparent);box-shadow:inset 3px 0 0 ${T.red}}
.xwm-trow.is-expanded{background:${T.soft}}
.xwm-tcell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.xwm-account-cell{font-weight:600;display:flex;align-items:center;gap:6px}
.xwm-index{color:${T.muted};font-variant-numeric:tabular-nums}
.xwm-action{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}
.xwm-action-ok{color:${T.green}}
.xwm-action-failed{color:${T.red}}
.xwm-action-running{color:${T.blue}}
.xwm-action-skipped,.xwm-action-unknown{color:${T.borderStrong}}
.xwm-result{font-size:11px;font-weight:650}
.xwm-result-ok{color:${T.green}}
.xwm-result-failed{color:${T.red}}
.xwm-result-skipped,.xwm-result-unknown{color:${T.muted}}
.xwm-result-running{color:${T.blue}}
.xwm-time{font-size:11px;color:${T.muted};font-variant-numeric:tabular-nums}
.xwm-row-detail{padding:12px 14px 14px;border-bottom:1px solid ${T.border};background:${T.soft}}
.xwm-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.xwm-detail-block{min-width:0}
.xwm-detail-label{font-size:10px;color:${T.muted};margin-bottom:2px}
.xwm-detail-value{font-size:12px;line-height:1.6;color:${T.text};word-break:break-word;white-space:pre-wrap}
.xwm-empty{padding:22px 14px;text-align:center;color:${T.muted};font-size:12px;line-height:1.8}
.xwm-empty strong{display:block;color:${T.secondary};font-weight:600;margin-bottom:2px}
.xwm-filter{display:flex;gap:4px;background:${T.soft};border:1px solid ${T.border};border-radius:8px;padding:2px}
.xwm-filter button{appearance:none;border:none;background:transparent;color:${T.muted};font:inherit;font-size:11px;padding:4px 9px;border-radius:6px;cursor:pointer;white-space:nowrap}
.xwm-filter button.is-active{background:${T.bg};color:${T.text};font-weight:650;box-shadow:0 0 0 1px ${T.border}}
.xwm-info-row{display:flex;justify-content:space-between;gap:12px;padding:5px 0;font-size:12px;line-height:1.55;border-bottom:1px dashed ${T.border}}
.xwm-info-row:last-child{border-bottom:none}
.xwm-info-label{color:${T.muted};flex:none}
.xwm-info-value{color:${T.text};text-align:right;min-width:0;word-break:break-word}
.xwm-safety-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;font-size:12px;border-bottom:1px dashed ${T.border}}
.xwm-safety-row:last-of-type{border-bottom:none}
.xwm-safety-label{color:${T.muted}}
.xwm-safety-value{display:flex;align-items:center;gap:6px;font-weight:600;color:${T.text};text-align:right}
.xwm-state-dot{width:7px;height:7px;border-radius:999px;flex:none}
.xwm-today{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:8px}
.xwm-today-cell{background:${T.soft};border:1px solid ${T.border};border-radius:8px;padding:6px 7px;text-align:center;min-width:0}
.xwm-today-label{display:block;font-size:10px;color:${T.muted}}
.xwm-today-value{display:block;font-size:14px;font-weight:650;font-variant-numeric:tabular-nums;color:${T.text}}
.xwm-pending-item{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px dashed ${T.border}}
.xwm-pending-item:last-child{border-bottom:none}
.xwm-pending-main{min-width:0}
.xwm-pending-handle{font-size:12px;font-weight:650;color:${T.text}}
.xwm-pending-meta{font-size:11px;color:${T.muted};line-height:1.55;margin-top:1px;word-break:break-word}
.xwm-pending-state{font-size:10px;font-weight:650;padding:1px 6px;border-radius:999px;border:1px solid ${T.border};background:${T.soft};color:${T.secondary};white-space:nowrap}
.xwm-pending-state.is-failed{color:${T.red}}
.xwm-section{border:1px solid ${T.border};border-radius:14px;background:${T.bg};overflow:hidden;margin-top:14px}
.xwm-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;background:transparent;border:none;width:100%;font:inherit;text-align:left;cursor:pointer;color:${T.text}}
.xwm-section-head:hover{background:${T.soft}}
.xwm-section-title{font-size:14px;font-weight:650;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.xwm-chevron{display:inline-block;font-size:10px;color:${T.muted};transition:transform .15s ease;transform:rotate(-90deg)}
.xwm-chevron.is-open{transform:rotate(0)}
.xwm-section-body{padding:0 16px 16px;border-top:1px solid ${T.border}}
.xwm-log-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0}
.xwm-check{display:flex;align-items:center;gap:5px;font-size:11px;color:${T.secondary};cursor:pointer;white-space:nowrap}
.xwm-check input{margin:0}
.xwm-input{box-sizing:border-box;padding:5px 8px;border-radius:7px;border:1px solid ${T.borderStrong};background:${T.bg};color:${T.text};font-size:12px;font-family:inherit;min-width:0}
.xwm-input:focus{outline:2px solid ${T.blue};outline-offset:1px}
.xwm-log{max-height:360px;overflow:auto;margin:0;padding:10px 12px;border-radius:9px;border:1px solid ${T.border};background:${T.soft};color:${T.secondary};font-family:${T.mono};font-size:11px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
.xwm-log::-webkit-scrollbar{width:9px}
.xwm-log::-webkit-scrollbar-thumb{background:${T.borderStrong};border-radius:999px}
.xwm-log-meta{font-size:10px;color:${T.muted};margin-top:6px;line-height:1.6}
.xwm-subsection-title{font-size:11px;color:${T.muted};margin-bottom:6px}
.xwm-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.xwm-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.xwm-field label{font-size:12px;font-weight:600;color:${T.secondary}}
.xwm-field-hint{font-size:11px;color:${T.muted};line-height:1.5}
.xwm-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.42);display:flex;align-items:center;justify-content:center;padding:24px}
.xwm-dialog{width:min(520px,100%);max-height:calc(100vh - 48px);overflow:auto;border-radius:16px;border:1px solid ${T.borderStrong};background:${T.bg};box-shadow:0 20px 60px rgba(0,0,0,.28);color:${T.text}}
.xwm-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid ${T.border}}
.xwm-dialog-title{font-size:15px;font-weight:650}
.xwm-dialog-body{padding:16px 18px}
.xwm-dialog-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid ${T.border}}
.xwm-drawer-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.42);display:flex;justify-content:flex-end}
.xwm-drawer{width:min(980px,94vw);height:100%;background:${T.bg};border-left:1px solid ${T.borderStrong};box-shadow:-16px 0 50px rgba(0,0,0,.25);display:flex;flex-direction:column;color:${T.text}}
.xwm-drawer-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid ${T.border}}
.xwm-drawer-body{flex:1;min-height:0;overflow:auto;padding:12px 18px 24px}
.xwm-drawer-body::-webkit-scrollbar{width:10px}
.xwm-drawer-body::-webkit-scrollbar-thumb{background:${T.borderStrong};border-radius:999px}
.xwm-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:1200;padding:9px 16px;border-radius:999px;background:${T.text};color:${T.bg};font-size:12px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:80vw;text-align:center}
.xwm-error-box{padding:7px 10px;border-radius:8px;border:1px solid ${T.border};background:${T.soft};color:${T.red};font-size:11px;line-height:1.6}
.xwm-source-tag{font-size:10px;color:${T.muted};border:1px solid ${T.border};border-radius:999px;padding:1px 7px;white-space:nowrap}
@media (max-width:1099px){
  .xwm-grid{grid-template-columns:minmax(0,1fr)}
  .xwm-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:719px){
  .xwm-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
  .xwm-table-head,.xwm-trow{grid-template-columns:36px minmax(100px,1.5fr) 50px 50px 50px 72px}
  .xwm-table-head .xwm-col-time,.xwm-trow .xwm-col-time{display:none}
  .xwm-today{grid-template-columns:repeat(3,minmax(0,1fr))}
  .xwm-settings-grid{grid-template-columns:1fr}
  .xwm-topbar{padding-top:14px}
  .xwm-title{font-size:19px}
}
`;

    // ---------------------------------------------------------------------
    // Small helpers
    // ---------------------------------------------------------------------
    function classNames() {
      return Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
    }

    function valueOr(value, fallback) {
      return value == null || value === '' ? (fallback == null ? '—' : fallback) : value;
    }

    function numberOrNull(value) {
      if (value === null || value === undefined || value === '') return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }

    function parseTime(value) {
      if (!value) return null;
      const ms = Date.parse(String(value));
      return Number.isFinite(ms) ? ms : null;
    }

    function formatDuration(totalSeconds) {
      if (totalSeconds == null || !Number.isFinite(Number(totalSeconds))) return '—';
      let seconds = Math.max(0, Math.round(Number(totalSeconds)));
      const hours = Math.floor(seconds / 3600);
      seconds -= hours * 3600;
      const minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      if (hours > 0) return hours + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
      return minutes + ':' + String(seconds).padStart(2, '0');
    }

    function formatClock(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    }

    function formatDateTime(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') + ' ' +
        String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    }

    function timezoneShort(zone) {
      if (!zone) return '';
      const map = {
        'America/Los_Angeles': 'PT',
        'America/New_York': 'ET',
        'America/Chicago': 'CT',
        'America/Denver': 'MT',
        'Asia/Shanghai': 'CST',
        'Asia/Tokyo': 'JST',
        'Europe/London': 'UK',
        'UTC': 'UTC',
      };
      return map[zone] || zone;
    }

    function inferLegacyStatus(control) {
      if (!control) return 'idle';
      if (control.running) return 'running';
      if (control.exit_code === 0) return 'completed';
      if (control.exit_code === -15 || control.exit_code === -9 || control.exit_code === 143) return 'stopped';
      if (control.exit_code != null) return 'failed';
      return 'idle';
    }

    function statusInfo(key, t) {
      const map = {
        running: { cls: 'xwm-pill-running', label: 'status.running' },
        completed: { cls: 'xwm-pill-completed', label: 'status.completed' },
        stopped: { cls: 'xwm-pill-stopped', label: 'status.stopped' },
        failed: { cls: 'xwm-pill-failed', label: 'status.failed' },
        idle: { cls: 'xwm-pill-idle', label: 'status.idle' },
        disconnected: { cls: 'xwm-pill-disconnected', label: 'status.disconnected' },
      };
      const item = map[key] || map.idle;
      return { cls: item.cls, label: t(item.label) };
    }

    function statusColor(key) {
      if (key === 'running') return T.blue;
      if (key === 'completed') return T.green;
      if (key === 'stopped') return T.orange;
      if (key === 'failed' || key === 'disconnected') return T.red;
      return T.muted;
    }

    function actionKeyFromChinese(word) {
      if (word === '关注') return 'follow';
      if (word === '点赞') return 'like';
      if (word === '回复') return 'reply';
      return 'action';
    }

    function describeErrorCode(t, code) {
      if (!code) return '';
      const key = 'err.' + String(code);
      const text = t(key);
      return text === key ? String(code) : text;
    }

    function describeStopReason(t, raw, stop) {
      if (stop) {
        const key = 'stop.' + (stop.action === 'follow' ? 'followFailed' : stop.action === 'like' ? 'likeFailed' : 'replyFailed');
        return t(key, { detail: describeErrorCode(t, stop.errorCode) || stop.raw });
      }
      if (!raw) return '';
      const match = /^(follow|like|reply)_failed:([^:]+)$/.exec(String(raw));
      if (match) {
        const key = match[1] === 'follow' ? 'stop.followFailed' : match[1] === 'like' ? 'stop.likeFailed' : 'stop.replyFailed';
        return t(key, { detail: describeErrorCode(t, match[2]) });
      }
      const simple = /^(follow|like|reply)_failed$/.exec(String(raw));
      if (simple) {
        const key = simple[1] === 'follow' ? 'stop.followFailed' : simple[1] === 'like' ? 'stop.likeFailed' : 'stop.replyFailed';
        return t(key, { detail: '—' });
      }
      if (raw === 'user_stopped') return t('stop.userStopped');
      if (raw === 'rounds_done' || raw === 'rounds_completed') return t('stop.roundsDone');
      if (raw === 'completed') return t('stop.completed');
      return String(raw);
    }

    function describeLogLine(t, line) {
      const raw = String(line || '').trim();
      if (!raw) return '';
      let match = /^STOP:\s*(关注|点赞|回复)\s+@([A-Za-z0-9_]+)\s+失败(?:（([^）]+)）)?/.exec(raw);
      if (match) {
        const key = match[1] === '关注' ? 'stop.followFailed' : match[1] === '点赞' ? 'stop.likeFailed' : 'stop.replyFailed';
        return t(key, { detail: describeErrorCode(t, match[3]) || raw });
      }
      if (/^CLEAN:/.test(raw)) return t('event.chromeClean');
      match = /^\[(\d+)\/(\d+)\]\s+@([A-Za-z0-9_]+):/.exec(raw);
      if (match) return t('event.checking', { handle: match[3] });
      if (raw === '已停止，不重试。') return t('event.stoppedNoRetry');
      if (/agent-desktop 权限 OK/.test(raw)) return t('event.permissionOk');
      match = /^==\s*(.+?)\s*==$/.exec(raw);
      if (match) return t('event.stage', { name: match[1] });
      return raw;
    }

    function parseRunLog(text) {
      const raw = String(text || '');
      const lines = raw.split(/\r?\n/).filter((line, index, all) => !(index === all.length - 1 && line === ''));
      const rows = [];
      let lastIndex = 0;
      let maxChecks = 0;
      let lastHandle = '';
      let stop = null;
      lines.forEach((line) => {
        let match = /^\[(\d+)\/(\d+)\]\s+@([A-Za-z0-9_]+):\s?(.*)$/.exec(line);
        if (match) {
          lastIndex = Number(match[1]) || lastIndex;
          maxChecks = Number(match[2]) || maxChecks;
          lastHandle = match[3];
          rows.push({
            index: Number(match[1]) || rows.length + 1,
            handle: match[3],
            tweet: match[4] || '',
            follow: 'unknown',
            like: 'unknown',
            reply: 'unknown',
            result: 'unknown',
            time: '',
            detail: '',
            replyText: '',
            attempt: null,
            source: 'log',
          });
        }
        match = /^STOP:\s*(关注|点赞|回复)\s+@([A-Za-z0-9_]+)\s+失败(?:（([^）]+)）)?/.exec(line);
        if (match) {
          stop = { action: actionKeyFromChinese(match[1]), handle: match[2], errorCode: match[3] || '', raw: line };
        }
      });
      if (stop) {
        for (let i = rows.length - 1; i >= 0; i -= 1) {
          if (String(rows[i].handle).toLowerCase() === String(stop.handle).toLowerCase()) {
            rows[i][stop.action] = 'failed';
            rows[i].result = 'failed';
            rows[i].detail = stop.errorCode;
            break;
          }
        }
      }
      const lastLine = stop ? stop.raw : (lines.length ? lines[lines.length - 1] : '');
      return { lines, rows, lastIndex, maxChecks, lastHandle, stop, lastLine };
    }

    function rowsFromActions(items) {
      const rows = [];
      const indexByTarget = Object.create(null);
      const list = Array.isArray(items) ? items.slice().sort((a, b) => {
        const aid = Number(a && a.id);
        const bid = Number(b && b.id);
        if (Number.isFinite(aid) && Number.isFinite(bid)) return aid - bid;
        const at = Date.parse(String((a && a.ts) || ''));
        const bt = Date.parse(String((b && b.ts) || ''));
        return (Number.isFinite(at) ? at : 0) - (Number.isFinite(bt) ? bt : 0);
      }) : [];
      for (const item of list) {
        if (!item || !item.target) continue;
        const key = String(item.target).toLowerCase();
        let row = indexByTarget[key];
        if (!row) {
          row = {
            index: rows.length + 1,
            handle: String(item.target),
            tweet: '',
            follow: 'unknown',
            like: 'unknown',
            reply: 'unknown',
            result: 'unknown',
            time: '',
            detail: '',
            replyText: '',
            attempt: null,
            source: 'actions',
          };
          indexByTarget[key] = row;
          rows.push(row);
        }
        const action = String(item.action || '');
        const status = String(item.status || '');
        if (action === 'follow' || action === 'like' || action === 'reply') {
          if (status === 'ok' || status === 'skipped' || status === 'failed') row[action] = status;
          if (status === 'failed' && !row.detail) row.detail = item.error_code || item.detail || '';
          if (action === 'reply' && status === 'ok' && item.reply_text) row.replyText = String(item.reply_text);
        }
        if (!row.time && item.ts) row.time = item.ts;
        if (item.ts) row.time = item.ts;
        const attempt = numberOrNull(item.attempt);
        if (attempt != null && (row.attempt == null || attempt > row.attempt)) row.attempt = attempt;
      }
      for (const row of rows) {
        if (row.follow === 'failed' || row.like === 'failed' || row.reply === 'failed') row.result = 'failed';
        else if (row.follow === 'ok' || row.like === 'ok' || row.reply === 'ok') row.result = 'ok';
        else if (row.follow === 'skipped' || row.like === 'skipped' || row.reply === 'skipped') row.result = 'skipped';
      }
      return rows;
    }

    // ---------------------------------------------------------------------
    // Data hooks
    // ---------------------------------------------------------------------
    function useStatusFeed() {
      const [state, setState] = useState({ loading: true, mode: 'legacy', data: null, error: '' });
      const requestId = useRef(0);
      const refreshing = useRef(false);
      const refresh = useCallback(async (poll = false) => {
        if (poll && refreshing.current) return;
        const id = ++requestId.current;
        refreshing.current = true;
        try {
          const res = await fetch(STATUS_V2_ENDPOINT, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
          if (res.ok) {
            const data = await res.json();
            if (data && data.ok === true && data.run) {
              if (id === requestId.current) setState({ loading: false, mode: 'v2', data, error: '' });
              return true;
            }
          }
        } catch (err) {
          // /status/v2 is optional; fall through to the legacy endpoint.
        }
        try {
          const res = await fetch(STATUS_ENDPOINT, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          if (id === requestId.current) setState({ loading: false, mode: 'legacy', data, error: '' });
          return true;
        } catch (err) {
          if (id === requestId.current) setState((prev) => ({ ...prev, loading: false, error: String(err) }));
          return false;
        } finally {
          if (id === requestId.current) refreshing.current = false;
        }
      }, []);
      useEffect(() => {
        refresh();
        const timer = setInterval(() => refresh(true), STATUS_POLL_MS);
        return () => { requestId.current += 1; clearInterval(timer); };
      }, [refresh]);
      return { ...state, refresh };
    }

    function useControlStatus() {
      const [state, setState] = useState({ loading: true, connected: false, control: null });
      const requestId = useRef(0);
      const refreshing = useRef(false);
      const adopt = useCallback((control) => {
        if (!control) return;
        setState({ loading: false, connected: true, control });
      }, []);
      const refresh = useCallback(async (poll = false) => {
        if (poll && refreshing.current) return;
        const id = ++requestId.current;
        refreshing.current = true;
        try {
          const res = await fetch(CONTROL_STATUS_ENDPOINT, { cache: 'no-store', signal: AbortSignal.timeout(1500) });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          if (!data || data.ok !== true || !data.control) throw new Error('invalid response');
          if (id === requestId.current) setState({ loading: false, connected: true, control: data.control });
          return data.control;
        } catch (err) {
          if (id === requestId.current) setState((prev) => ({ loading: false, connected: false, control: prev.control }));
          return null;
        } finally {
          if (id === requestId.current) refreshing.current = false;
        }
      }, []);
      useEffect(() => {
        refresh();
        const timer = setInterval(() => refresh(true), CONTROL_POLL_MS);
        return () => { requestId.current += 1; clearInterval(timer); };
      }, [refresh]);
      return { ...state, refresh, adopt };
    }

    function useOptionalEndpoint(url, intervalMs, enabled) {
      const [state, setState] = useState({ loading: true, data: null, error: '' });
      useEffect(() => {
        let alive = true;
        setState({ loading: enabled, data: null, error: '' });
        if (!enabled) return;
        const tick = async () => {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (!data || data.ok !== true) throw new Error('invalid response');
            if (alive) setState({ loading: false, data, error: '' });
          } catch (err) {
            if (alive) setState({ loading: false, data: null, error: String(err) });
          }
        };
        tick();
        const timer = setInterval(tick, intervalMs || OPTIONAL_POLL_MS);
        return () => { alive = false; clearInterval(timer); };
      }, [url, intervalMs, enabled]);
      return state;
    }

    function useNow(active) {
      const [now, setNow] = useState(() => Date.now());
      useEffect(() => {
        if (!active) return undefined;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
      }, [active]);
      return now;
    }

    // ---------------------------------------------------------------------
    // View model
    // ---------------------------------------------------------------------
    function buildViewModel(input) {
      const { statusFeed, control, controlConnected, actionsData, runsData, pendingData, now } = input;
      const mode = statusFeed.mode;
      const payload = statusFeed.data;
      const legacy = mode !== 'v2';
      const workflow = payload && payload.workflow ? payload.workflow : {};
      const connect = workflow.connect || {};
      const log = parseRunLog(control && control.log_tail);
      const v2run = !legacy && payload ? (payload.run || {}) : null;
      const v2counts = !legacy && payload ? (payload.counts || {}) : null;
      const v2today = !legacy && payload ? (payload.today || {}) : null;
      const v2safety = !legacy && payload ? (payload.safety || {}) : null;

      const status = !controlConnected
        ? 'disconnected'
        : legacy
          ? inferLegacyStatus(control)
          : (v2run && v2run.status ? v2run.status : 'idle');

      const running = status === 'running';
      const startedAt = v2run ? v2run.started_at : (control && control.started_at);
      const endedAt = v2run ? v2run.ended_at : (control && control.ended_at);
      const startMs = parseTime(startedAt);
      const endMs = parseTime(endedAt);

      let elapsed = v2run && numberOrNull(v2run.elapsed_seconds) != null ? numberOrNull(v2run.elapsed_seconds) : null;
      if (running && startMs != null) elapsed = Math.max(0, Math.round((now - startMs) / 1000));
      else if (elapsed == null && startMs != null && endMs != null) elapsed = Math.max(0, Math.round((endMs - startMs) / 1000));

      const maxChecks = numberOrNull(v2run && v2run.max_checks) || numberOrNull(control && control.max_checks) || PER_ROUND;
      const checked = v2run && numberOrNull(v2run.checked) != null
        ? numberOrNull(v2run.checked)
        : Math.max(numberOrNull(connect.checked) || 0, log.lastIndex || 0);
      const roundsPlanned = v2run && numberOrNull(v2run.rounds_planned) != null
        ? numberOrNull(v2run.rounds_planned)
        : numberOrNull(control && control.rounds);

      let eta = v2run && numberOrNull(v2run.eta_seconds) != null ? numberOrNull(v2run.eta_seconds) : null;
      if (eta == null && legacy && running && checked > 0 && elapsed != null && maxChecks > checked) {
        eta = Math.round((elapsed / checked) * (maxChecks - checked));
      }

      const counts = {
        followOk: v2counts ? numberOrNull(v2counts.follow_ok) : numberOrNull(connect.new_follows),
        likeOk: v2counts ? numberOrNull(v2counts.like_ok) : numberOrNull(connect.likes),
        replyOk: v2counts ? numberOrNull(v2counts.reply_ok) : numberOrNull(connect.replies),
        failed: v2counts ? numberOrNull(v2counts.failed) : (log.stop ? 1 : null),
        skipped: v2counts ? numberOrNull(v2counts.skipped) : null,
      };

      const todaySource = v2today || (workflow.actions || {});
      const today = {
        timezone: v2today ? (v2today.timezone || '') : '',
        follow: numberOrNull(todaySource.follow),
        like: numberOrNull(todaySource.like),
        reply: numberOrNull(todaySource.reply),
        failed: v2today ? numberOrNull(v2today.failed) : null,
        skipped: v2today ? numberOrNull(v2today.skipped) : null,
        legacy: !v2today,
      };

      const safety = v2safety ? {
        chromeClean: v2safety.chrome_clean,
        chromeCheckedAt: v2safety.chrome_checked_at || '',
        platformAlerts: numberOrNull(v2safety.platform_alerts),
        egress: v2safety.egress || '',
      } : {
        chromeClean: workflow.chrome_clean == null ? null : !!workflow.chrome_clean,
        chromeCheckedAt: '',
        platformAlerts: null,
        egress: '',
      };

      const stopReasonRaw = v2run ? (v2run.stop_reason || '') : (log.stop ? log.stop.raw : '');
      const lastEvent = v2run && payload.last_event
        ? { text: payload.last_event.text || '', raw: '', level: payload.last_event.level || '', ts: payload.last_event.ts || '' }
        : { text: '', raw: log.lastLine || '', level: /error|失败|异常|traceback|stop/i.test(log.lastLine || '') ? 'error' : '', ts: '' };

      const currentTarget = v2run ? (v2run.current_target || '') : (connect.last_handle || log.lastHandle || '');
      const stage = v2run ? (v2run.stage || '') : (running && log.lastIndex ? 'running' : '');

      const rawMode = v2run && v2run.mode ? String(v2run.mode) : (control && control.dry_run ? 'dry-run' : 'execute');
      const runMode = rawMode === 'dry-run' || rawMode === 'dry_run' || rawMode === 'dry' ? 'dry-run' : 'execute';
      const runId = v2run && v2run.run_id ? v2run.run_id : (control && control.run_id) || '';

      const actionItems = actionsData && Array.isArray(actionsData.items) ? actionsData.items : null;
      let rows = [];
      let rowSource = 'none';
      if (actionItems && actionItems.length) {
        rows = rowsFromActions(actionItems);
        rowSource = 'actions';
      } else if (actionItems) {
        rowSource = 'actions';
      } else if (log.rows.length) {
        rows = log.rows;
        rowSource = 'log';
        if (connect.updated_at && rows.length) {
          rows = rows.slice();
          rows[rows.length - 1] = { ...rows[rows.length - 1], time: connect.updated_at };
        }
      }

      const runs = runsData && Array.isArray(runsData.items)
        ? runsData.items.filter((run) => !run || (run.mode !== 'dry-run' && run.mode !== 'dry_run'))
        : null;
      const pendingItems = pendingData && Array.isArray(pendingData.items) ? pendingData.items : null;
      const pendingSummary = !legacy && payload && payload.pending &&
        (payload.pending.count != null || payload.pending.failed != null || payload.pending.never_attempted != null)
        ? payload.pending
        : null;

      const blockers = [];
      if (legacy) blockers.push('GET /status/v2');
      if (!actionsData) blockers.push('GET /actions');
      if (!runsData) blockers.push('GET /runs');
      if (!pendingData) blockers.push('GET /pending');

      return {
        mode,
        payload,
        account: (payload && payload.account) || '',
        status,
        running,
        startedAt,
        endedAt,
        elapsed,
        eta,
        maxChecks,
        checked,
        roundsPlanned,
        roundIndex: v2run ? numberOrNull(v2run.round_index) : null,
        currentTarget,
        stage,
        counts,
        today,
        safety,
        stopReasonRaw,
        lastEvent,
        runMode,
        runId,
        exitCode: control ? control.exit_code : null,
        rows,
        rowSource,
        runs,
        runsAvailable: !!runsData,
        pendingItems,
        pendingSummary,
        pendingAvailable: !!pendingData,
        blockers,
        log,
        runLogLines: log.lines,
        dataUpdatedAt: payload ? (payload.updated_at || payload.generated_at || '') : '',
        dataAge: payload && numberOrNull(payload.data_age_seconds) != null ? numberOrNull(payload.data_age_seconds) : null,
      };
    }

    // ---------------------------------------------------------------------
    // Primitive components
    // ---------------------------------------------------------------------
    function Button({ children, onClick, disabled, variant, title, ariaLabel, small }) {
      return h('button', {
        type: 'button',
        className: classNames('xwm-btn', 'xwm-btn-' + (variant || 'secondary'), small ? 'xwm-btn-small' : null),
        onClick,
        disabled: !!disabled,
        title: title || undefined,
        'aria-label': ariaLabel || undefined,
      }, children);
    }

    function StatusPill({ status, t }) {
      const info = statusInfo(status, t);
      return h('span', { className: classNames('xwm-pill', info.cls) },
        h('span', { className: 'xwm-pill-dot', style: { background: statusColor(status) } }),
        info.label
      );
    }

    function MiniStat({ label, value }) {
      return h('div', { className: 'xwm-metric' },
        h('span', { className: 'xwm-metric-label' }, label),
        h('span', { className: 'xwm-metric-value' }, String(value == null || value === '' ? '—' : value))
      );
    }

    function InfoRow({ label, value, title }) {
      return h('div', { className: 'xwm-info-row' },
        h('span', { className: 'xwm-info-label' }, label),
        h('span', { className: 'xwm-info-value', title: title || undefined }, value == null || value === '' ? '—' : value)
      );
    }

    function SafetyRow({ label, value, color }) {
      return h('div', { className: 'xwm-safety-row' },
        h('span', { className: 'xwm-safety-label' }, label),
        h('span', { className: 'xwm-safety-value' },
          h('span', { className: 'xwm-state-dot', style: { background: color || T.borderStrong } }),
          value
        )
      );
    }

    function ActionMark({ status }) {
      const map = { ok: '✓', failed: '✗', skipped: '—', running: '…', unknown: '—' };
      return h('span', { className: 'xwm-action xwm-action-' + (status || 'unknown') }, map[status] || '—');
    }

    function ResultLabel({ status, t }) {
      const map = {
        ok: 'table.result.ok',
        failed: 'table.result.failed',
        skipped: 'table.result.skipped',
        running: 'table.result.running',
        unknown: 'table.result.unknown',
      };
      return h('span', { className: 'xwm-result xwm-result-' + (status || 'unknown') }, t(map[status] || map.unknown));
    }

    // ---------------------------------------------------------------------
    // Progress (sticky)
    // ---------------------------------------------------------------------
    function ProgressPanel({ vm, t }) {
      const percent = vm.maxChecks > 0 ? Math.min(100, Math.round((vm.checked / vm.maxChecks) * 100)) : 0;
      const fillClass = vm.status === 'failed' ? ' is-failed' : vm.status === 'completed' ? ' is-done' : vm.status === 'stopped' ? ' is-stopped' : '';
      const stageKey = vm.stage ? 'stage.' + vm.stage : '';
      const stageText = stageKey && t(stageKey) !== stageKey ? t(stageKey) : '';
      const currentLabel = vm.currentTarget
        ? t('progress.current', { handle: vm.currentTarget })
        : (vm.running ? t('progress.waiting') : t('progress.noTarget'));
      const eventText = vm.lastEvent.text || describeLogLine(t, vm.lastEvent.raw) || '—';
      return h('div', { className: 'xwm-progress-card' },
        h('div', { className: 'xwm-progress-top' },
          h('div', null,
            h('span', { className: 'xwm-progress-numbers' }, t('progress.checked', { checked: vm.checked, max: vm.maxChecks })),
            h('span', { className: 'xwm-progress-pct' }, t('progress.percent', { percent }))
          ),
          h('div', { className: 'xwm-progress-line' },
            h('strong', null, currentLabel),
            stageText ? h('span', { className: 'xwm-card-sub' }, '· ' + stageText) : null
          )
        ),
        h('div', { className: 'xwm-progress-track', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': vm.maxChecks, 'aria-valuenow': vm.checked },
          h('div', { className: 'xwm-progress-fill' + fillClass, style: { width: percent + '%' } })
        ),
        h('div', { className: 'xwm-metrics' },
          h(MiniStat, { label: t('progress.metric.checked'), value: vm.checked + '/' + vm.maxChecks }),
          h(MiniStat, { label: t('progress.metric.follow'), value: vm.counts.followOk }),
          h(MiniStat, { label: t('progress.metric.like'), value: vm.counts.likeOk }),
          h(MiniStat, { label: t('progress.metric.reply'), value: vm.counts.replyOk }),
          h(MiniStat, { label: t('progress.metric.failed'), value: vm.counts.failed }),
          h(MiniStat, { label: t('progress.metric.skipped'), value: vm.counts.skipped })
        ),
        h('div', { className: 'xwm-event', title: eventText },
          h('span', { className: 'xwm-event-dot' + (vm.lastEvent.level === 'error' ? ' is-error' : '') }),
          h('span', { className: 'xwm-event-text' }, t('progress.lastEventLine', { text: eventText }))
        )
      );
    }

    // ---------------------------------------------------------------------
    // Target table + drawer
    // ---------------------------------------------------------------------
    function TargetTable({ vm, t, maxRows, failedOnly, onViewAll, showViewAll }) {
      const [expandedKey, setExpandedKey] = useState('');
      const [filterFailed, setFilterFailed] = useState(false);
      const effectiveFailedOnly = failedOnly || filterFailed;
      let rows = vm.rows || [];
      if (effectiveFailedOnly) rows = rows.filter((row) => row.result === 'failed');
      const totalBeforeSlice = rows.length;
      if (maxRows && rows.length > maxRows) rows = rows.slice(-maxRows);

      let empty = null;
      if (!vm.rows || vm.rows.length === 0) {
        if (vm.rowSource === 'none') {
          empty = h('div', { className: 'xwm-empty' },
            h('strong', null, t('table.empty.none')),
            h('span', null, t('table.empty.noneHint'))
          );
        } else {
          empty = h('div', { className: 'xwm-empty' }, vm.rowSource === 'actions' ? t('table.empty.actions') : t('table.empty.log'));
        }
      } else if (rows.length === 0) {
        empty = h('div', { className: 'xwm-empty' }, t('table.empty.filtered'));
      }

      return h('div', null,
        h('div', { className: 'xwm-card' },
          h('div', { className: 'xwm-card-head' },
            h('div', { className: 'xwm-card-title' },
              t('table.title'),
              h('span', { className: 'xwm-card-sub' }, maxRows ? t('table.meta', { total: vm.rows.length, shown: Math.min(maxRows, totalBeforeSlice) }) : t('table.metaAll', { total: vm.rows.length }))
            ),
            h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
              h('div', { className: 'xwm-filter' },
                h('button', { type: 'button', className: !filterFailed ? 'is-active' : '', onClick: () => setFilterFailed(false) }, t('table.filterAll')),
                h('button', { type: 'button', className: filterFailed ? 'is-active' : '', onClick: () => setFilterFailed(true) }, t('table.filterFailed'))
              ),
              showViewAll ? h(Button, { variant: 'secondary', small: true, onClick: onViewAll, disabled: !vm.rows.length }, t('button.viewAll')) : null
            )
          ),
          vm.rowSource === 'log' ? h('div', { className: 'xwm-card-body', style: { paddingBottom: 0 } },
            h('div', { className: 'xwm-card-sub' }, t('table.logHint'))
          ) : null,
          h('div', { className: 'xwm-table-wrap' },
            h('div', { className: 'xwm-table-head', role: 'row' },
              h('span', { className: 'xwm-tcell', role: 'columnheader' }, t('table.col.index')),
              h('span', { className: 'xwm-tcell', role: 'columnheader' }, t('table.col.account')),
              h('span', { className: 'xwm-tcell', role: 'columnheader' }, t('table.col.follow')),
              h('span', { className: 'xwm-tcell', role: 'columnheader' }, t('table.col.like')),
              h('span', { className: 'xwm-tcell', role: 'columnheader' }, t('table.col.reply')),
              h('span', { className: 'xwm-tcell', role: 'columnheader' }, t('table.col.result')),
              h('span', { className: 'xwm-tcell xwm-col-time', role: 'columnheader' }, t('table.col.time'))
            ),
            empty || rows.map((row) => {
              const key = row.index + '-' + row.handle;
              const expanded = expandedKey === key;
              return h('div', { key },
                h('div', {
                  className: classNames('xwm-trow', row.result === 'failed' ? 'is-failed' : null, expanded ? 'is-expanded' : null),
                  role: 'row',
                  tabIndex: 0,
                  'aria-expanded': expanded,
                  onClick: () => setExpandedKey(expanded ? '' : key),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setExpandedKey(expanded ? '' : key);
                    }
                  },
                },
                  h('span', { className: 'xwm-tcell xwm-index' }, '#' + row.index),
                  h('span', { className: 'xwm-tcell xwm-account-cell', title: '@' + row.handle }, '@' + row.handle),
                  h('span', { className: 'xwm-tcell' }, h(ActionMark, { status: row.follow })),
                  h('span', { className: 'xwm-tcell' }, h(ActionMark, { status: row.like })),
                  h('span', { className: 'xwm-tcell' }, h(ActionMark, { status: row.reply })),
                  h('span', { className: 'xwm-tcell' }, h(ResultLabel, { status: row.result, t })),
                  h('span', { className: 'xwm-tcell xwm-time xwm-col-time' }, row.time ? formatClock(row.time) : '—')
                ),
                expanded ? h('div', { className: 'xwm-row-detail' },
                  h('div', { className: 'xwm-detail-grid' },
                    row.tweet ? h('div', { className: 'xwm-detail-block' },
                      h('div', { className: 'xwm-detail-label' }, t('table.detail.tweet')),
                      h('div', { className: 'xwm-detail-value' }, row.tweet)
                    ) : null,
                    row.replyText ? h('div', { className: 'xwm-detail-block' },
                      h('div', { className: 'xwm-detail-label' }, t('table.detail.reply')),
                      h('div', { className: 'xwm-detail-value' }, row.replyText)
                    ) : null,
                    row.detail ? h('div', { className: 'xwm-detail-block' },
                      h('div', { className: 'xwm-detail-label' }, t('table.detail.error')),
                      h('div', { className: 'xwm-detail-value' }, describeErrorCode(t, row.detail) || row.detail)
                    ) : null,
                    row.attempt != null ? h('div', { className: 'xwm-detail-block' },
                      h('div', { className: 'xwm-detail-label' }, t('table.detail.attempt')),
                      h('div', { className: 'xwm-detail-value' }, String(row.attempt))
                    ) : null,
                    h('div', { className: 'xwm-detail-block' },
                      h('div', { className: 'xwm-detail-label' }, t('table.detail.time')),
                      h('div', { className: 'xwm-detail-value' }, row.time ? formatDateTime(row.time) : '—')
                    )
                  )
                ) : null
              );
            })
          )
        )
      );
    }

    function ViewAllDrawer({ vm, t, onClose }) {
      useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.removeEventListener('keydown', onKey);
          document.body.style.overflow = previous;
        };
      }, [onClose]);
      return ReactDOM.createPortal(
        h('div', { className: 'xwm-drawer-overlay', onMouseDown: (event) => { if (event.target === event.currentTarget) onClose(); } },
          h('div', { className: 'xwm-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('table.allTitle', { total: vm.rows.length }) },
            h('div', { className: 'xwm-drawer-head' },
              h('div', { className: 'xwm-dialog-title' }, t('table.allTitle', { total: vm.rows.length })),
              h(Button, { variant: 'secondary', small: true, onClick: onClose }, t('button.close'))
            ),
            h('div', { className: 'xwm-drawer-body' },
              h(TargetTable, { vm, t, maxRows: null, showViewAll: false })
            )
          )
        ),
        document.body
      );
    }

    // ---------------------------------------------------------------------
    // Right column cards
    // ---------------------------------------------------------------------
    function PendingCard({ vm, t, onCopy }) {
      const items = vm.pendingItems || [];
      const summary = vm.pendingSummary;
      const failed = items.filter((item) => item.state === 'failed');
      const never = items.filter((item) => item.state === 'never_attempted');
      const count = summary && summary.count != null ? summary.count : (vm.pendingAvailable ? items.length : null);
      return h('div', { className: 'xwm-card' },
        h('div', { className: 'xwm-card-head' },
          h('div', { className: 'xwm-card-title' }, t('pending.title'),
            count != null ? h('span', { className: 'xwm-card-sub' }, String(count)) : null
          ),
          summary && summary.failed != null ? h('span', { className: 'xwm-card-sub' }, t('pending.failed', { count: summary.failed })) : null
        ),
        h('div', { className: 'xwm-card-body' },
          !vm.pendingAvailable && !summary ? h('div', { className: 'xwm-empty', style: { padding: '12px 8px' } }, t('pending.unavailable')) : null,
          vm.pendingAvailable && !items.length ? h('div', { className: 'xwm-empty', style: { padding: '12px 8px' } }, t('pending.empty')) : null,
          summary && !vm.pendingAvailable && count !== 0 ? h('div', { className: 'xwm-empty', style: { padding: '12px 8px' } }, t('pending.countOnly', { count: count == null ? '—' : count })) : null,
          summary && !vm.pendingAvailable && count === 0 ? h('div', { className: 'xwm-empty', style: { padding: '12px 8px' } }, t('pending.empty')) : null,
          failed.length ? h('div', null,
            h('div', { className: 'xwm-subsection-title' }, t('pending.failed', { count: failed.length })),
            failed.map((item, index) => h('div', { className: 'xwm-pending-item', key: 'f-' + index },
              h('div', { className: 'xwm-pending-main' },
                h('div', { className: 'xwm-pending-handle' }, '@' + item.handle),
                h('div', { className: 'xwm-pending-meta' },
                  (item.last_error ? describeErrorCode(t, item.last_error) : t('common.unknown')) +
                  (item.reply_attempts != null ? ' · ' + t('pending.attempts', { count: item.reply_attempts }) : '') +
                  (item.followed_at ? ' · ' + t('pending.followedAt', { time: formatClock(item.followed_at) }) : '')
                )
              ),
              h(Button, { variant: 'ghost', small: true, onClick: () => onCopy(item.handle) }, t('button.copy', { handle: item.handle }))
            ))
          ) : null,
          never.length ? h('div', { style: { marginTop: failed.length ? 10 : 0 } },
            h('div', { className: 'xwm-subsection-title' }, t('pending.never', { count: never.length })),
            never.map((item, index) => h('div', { className: 'xwm-pending-item', key: 'n-' + index },
              h('div', { className: 'xwm-pending-main' },
                h('div', { className: 'xwm-pending-handle' }, '@' + item.handle),
                h('div', { className: 'xwm-pending-meta' },
                  h('span', { className: 'xwm-pending-state' }, t('pending.state.never_attempted')),
                  item.followed_at ? ' · ' + t('pending.followedAt', { time: formatClock(item.followed_at) }) : null
                )
              ),
              h(Button, { variant: 'ghost', small: true, onClick: () => onCopy(item.handle) }, t('button.copy', { handle: item.handle }))
            ))
          ) : null
        )
      );
    }

    function RunInfoCard({ vm, t }) {
      const mode = vm.runMode === 'dry-run' ? t('run.mode.dry') : t('run.mode.execute');
      return h('div', { className: 'xwm-card' },
        h('div', { className: 'xwm-card-head' },
          h('div', { className: 'xwm-card-title' }, t('run.title'))
        ),
        h('div', { className: 'xwm-card-body' },
          h(InfoRow, { label: t('run.mode'), value: t('run.modeRounds', { mode, rounds: vm.roundsPlanned == null ? '—' : vm.roundsPlanned }) }),
          h(InfoRow, { label: t('run.time'), value: t('run.timeRange', { start: formatClock(vm.startedAt), end: vm.running ? t('run.notEnded') : formatClock(vm.endedAt), duration: formatDuration(vm.elapsed) }) }),
          h(InfoRow, { label: t('run.checked'), value: t('run.checkedExit', { checked: vm.checked, max: vm.maxChecks, code: vm.exitCode == null ? '—' : vm.exitCode }) }),
          h(InfoRow, { label: t('run.stopReason'), value: describeStopReason(t, vm.stopReasonRaw, vm.log.stop) || '—' })
        )
      );
    }

    function SafetyCard({ vm, t }) {
      const safety = vm.safety;
      const clean = safety.chromeClean;
      const browserText = clean === true ? t('safety.clean') : clean === false ? t('safety.abnormal') : t('safety.unchecked');
      const browserColor = clean === true ? T.green : clean === false ? T.red : T.orange;
      const alerts = safety.platformAlerts;
      const alertsText = alerts == null ? t('safety.alertsUnknown') : String(alerts);
      const alertsColor = alerts == null ? T.orange : alerts > 0 ? T.red : T.green;
      const egressText = !safety.egress || safety.egress === 'unchecked' ? t('safety.egressUnchecked') : String(safety.egress);
      const egressColor = safety.egress && safety.egress !== 'unchecked' ? T.green : T.orange;
      const zone = vm.today.timezone || '';
      return h('div', { className: 'xwm-card' },
        h('div', { className: 'xwm-card-head' },
          h('div', { className: 'xwm-card-title' }, t('safety.title')),
          vm.today.timezone ? h('span', { className: 'xwm-card-sub' }, timezoneShort(vm.today.timezone)) : null
        ),
        h('div', { className: 'xwm-card-body' },
          h(SafetyRow, { label: t('safety.browser'), value: browserText + (safety.chromeCheckedAt ? ' · ' + formatClock(safety.chromeCheckedAt) : ''), color: browserColor }),
          h(SafetyRow, { label: t('safety.alerts'), value: alertsText, color: alertsColor }),
          h(SafetyRow, { label: t('safety.egress'), value: egressText, color: egressColor }),
          h(SafetyRow, { label: t('safety.timezone'), value: zone ? zone : t('safety.timezoneUnknown'), color: zone ? T.green : T.orange }),
          h('div', { style: { marginTop: 12 } },
            h('div', { className: 'xwm-subsection-title' }, t('safety.today') + ' · ' + (vm.today.legacy ? t('safety.todayHintLegacy') : t('safety.todayHint'))),
            h('div', { className: 'xwm-today' },
              h('div', { className: 'xwm-today-cell' }, h('span', { className: 'xwm-today-label' }, t('safety.today.follow')), h('span', { className: 'xwm-today-value' }, valueOr(vm.today.follow))),
              h('div', { className: 'xwm-today-cell' }, h('span', { className: 'xwm-today-label' }, t('safety.today.like')), h('span', { className: 'xwm-today-value' }, valueOr(vm.today.like))),
              h('div', { className: 'xwm-today-cell' }, h('span', { className: 'xwm-today-label' }, t('safety.today.reply')), h('span', { className: 'xwm-today-value' }, valueOr(vm.today.reply))),
              h('div', { className: 'xwm-today-cell' }, h('span', { className: 'xwm-today-label' }, t('safety.today.failed')), h('span', { className: 'xwm-today-value' }, valueOr(vm.today.failed))),
              h('div', { className: 'xwm-today-cell' }, h('span', { className: 'xwm-today-label' }, t('safety.today.skipped')), h('span', { className: 'xwm-today-value' }, valueOr(vm.today.skipped)))
            )
          )
        )
      );
    }

    // ---------------------------------------------------------------------
    // P1: run history / reply audit
    // ---------------------------------------------------------------------
    function RunResultLabel({ status, t }) {
      const map = {
        completed: { text: 'status.completed', cls: 'xwm-result-ok' },
        failed: { text: 'status.failed', cls: 'xwm-result-failed' },
        stopped: { text: 'status.stopped', cls: 'xwm-result-skipped' },
        running: { text: 'status.running', cls: 'xwm-result-running' },
        idle: { text: 'table.result.unknown', cls: 'xwm-result-unknown' },
      };
      const item = map[status] || map.idle;
      return h('span', { className: 'xwm-result ' + item.cls }, t(item.text));
    }

    function RunHistoryCard({ vm, t }) {
      const runs = vm.runs;
      return h('div', { className: 'xwm-card', style: { marginTop: 14 } },
        h('div', { className: 'xwm-card-head' },
          h('div', { className: 'xwm-card-title' }, t('history.title'), h('span', { className: 'xwm-card-sub' }, t('history.subtitle')))
        ),
        h('div', { className: 'xwm-card-body', style: { padding: 0 } },
          !vm.runsAvailable ? h('div', { className: 'xwm-empty' }, t('history.unavailable')) :
            !runs || !runs.length ? h('div', { className: 'xwm-empty' }, t('history.empty')) :
              h('div', null,
                h('div', { className: 'xwm-table-head', style: { gridTemplateColumns: 'minmax(90px,1.1fr) 64px 52px 56px minmax(110px,1.2fr) 50px 70px minmax(110px,1.4fr)' } },
                  h('span', { className: 'xwm-tcell' }, t('history.col.start')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.mode')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.rounds')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.checked')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.actions')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.failed')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.result')),
                  h('span', { className: 'xwm-tcell' }, t('history.col.stop'))
                ),
                runs.map((run, index) => h('div', {
                  key: run.run_id || index,
                  className: 'xwm-trow',
                  style: { gridTemplateColumns: 'minmax(90px,1.1fr) 64px 52px 56px minmax(110px,1.2fr) 50px 70px minmax(110px,1.4fr)', cursor: 'default' },
                },
                  h('span', { className: 'xwm-tcell xwm-time' }, formatDateTime(run.started_at)),
                  h('span', { className: 'xwm-tcell' }, run.mode === 'dry-run' ? t('run.mode.dry') : t('run.mode.execute')),
                  h('span', { className: 'xwm-tcell' }, valueOr(run.rounds_planned)),
                  h('span', { className: 'xwm-tcell' }, valueOr(run.checked)),
                  h('span', { className: 'xwm-tcell' }, valueOr(run.follow_ok) + ' / ' + valueOr(run.like_ok) + ' / ' + valueOr(run.reply_ok)),
                  h('span', { className: 'xwm-tcell' }, valueOr(run.failed)),
                  h('span', { className: 'xwm-tcell' }, h(RunResultLabel, { status: run.status, t })),
                  h('span', { className: 'xwm-tcell', title: run.stop_reason || '' }, run.stop_reason ? describeStopReason(t, run.stop_reason, null) : '—')
                ))
              )
        )
      );
    }

    function ReplyAuditCard({ vm, t }) {
      const items = (vm.rows || []).filter((row) => row.replyText);
      return h('div', { className: 'xwm-card', style: { marginTop: 14 } },
        h('div', { className: 'xwm-card-head' },
          h('div', { className: 'xwm-card-title' }, t('audit.title'), h('span', { className: 'xwm-card-sub' }, t('audit.subtitle')))
        ),
        h('div', { className: 'xwm-card-body', style: { padding: 0 } },
          vm.rowSource !== 'actions' ? h('div', { className: 'xwm-empty' }, t('audit.unavailable')) :
            !items.length ? h('div', { className: 'xwm-empty' }, t('audit.empty')) :
              h('div', null,
                h('div', { className: 'xwm-table-head', style: { gridTemplateColumns: '86px minmax(110px,1fr) minmax(220px,3fr) 52px 60px' } },
                  h('span', { className: 'xwm-tcell' }, t('audit.col.time')),
                  h('span', { className: 'xwm-tcell' }, t('audit.col.account')),
                  h('span', { className: 'xwm-tcell' }, t('audit.col.text')),
                  h('span', { className: 'xwm-tcell' }, t('audit.col.chars')),
                  h('span', { className: 'xwm-tcell' }, t('audit.col.status'))
                ),
                items.map((row, index) => h('div', { key: index, className: 'xwm-trow', style: { gridTemplateColumns: '86px minmax(110px,1fr) minmax(220px,3fr) 52px 60px', cursor: 'default' } },
                  h('span', { className: 'xwm-tcell xwm-time' }, row.time ? formatClock(row.time) : '—'),
                  h('span', { className: 'xwm-tcell' }, '@' + row.handle),
                  h('span', { className: 'xwm-tcell', title: row.replyText }, row.replyText),
                  h('span', { className: 'xwm-tcell' }, String(Array.from(row.replyText).length)),
                  h('span', { className: 'xwm-tcell' }, h(ResultLabel, { status: row.result, t }))
                ))
              )
        )
      );
    }

    // ---------------------------------------------------------------------
    // P2 collapsible sections
    // ---------------------------------------------------------------------
    function Section({ title, subtitle, defaultOpen, children, t }) {
      const [open, setOpen] = useState(!!defaultOpen);
      return h('div', { className: 'xwm-section' },
        h('button', { type: 'button', className: 'xwm-section-head', 'aria-expanded': open, onClick: () => setOpen(!open) },
          h('span', { className: 'xwm-section-title' },
            h('span', { className: 'xwm-chevron' + (open ? ' is-open' : '') }, '▾'),
            title,
            subtitle ? h('span', { className: 'xwm-card-sub' }, subtitle) : null
          ),
          h('span', { className: 'xwm-card-sub' }, open ? t('button.collapse') : '')
        ),
        open ? h('div', { className: 'xwm-section-body' }, children) : null
      );
    }

    function LogPanel({ vm, t }) {
      const [autoFollow, setAutoFollow] = useState(true);
      const [errorsOnly, setErrorsOnly] = useState(false);
      const [search, setSearch] = useState('');
      const preRef = useRef(null);
      const allLines = vm.runLogLines || [];
      const filtered = allLines.filter((line) => {
        if (errorsOnly && !/error|fail|失败|异常|stop|traceback|超时|timeout/i.test(line)) return false;
        if (search && !line.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
      const shown = filtered.slice(-500);
      const logText = shown.join('\n');
      const lineCount = allLines.length;
      useEffect(() => {
        const node = preRef.current;
        if (!node || !autoFollow) return;
        node.scrollTop = node.scrollHeight;
      }, [logText, autoFollow]);
      const onScroll = () => {
        const node = preRef.current;
        if (!node) return;
        const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 28;
        if (!nearBottom && autoFollow) setAutoFollow(false);
      };
      const download = () => {
        try {
          const blob = new Blob([allLines.join('\n')], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'x-workflow-log-' + (vm.runId || 'latest') + '.txt';
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
          // Download is a convenience; ignore browser restrictions.
        }
      };
      return h('div', null,
        h('div', { className: 'xwm-log-toolbar' },
          h('label', { className: 'xwm-check' },
            h('input', { type: 'checkbox', checked: autoFollow, onChange: (event) => setAutoFollow(event.target.checked) }),
            t('logs.autoFollow')
          ),
          h('label', { className: 'xwm-check' },
            h('input', { type: 'checkbox', checked: errorsOnly, onChange: (event) => setErrorsOnly(event.target.checked) }),
            t('logs.errorsOnly')
          ),
          h('input', {
            className: 'xwm-input',
            style: { flex: '1 1 150px' },
            type: 'search',
            value: search,
            placeholder: t('logs.search'),
            'aria-label': t('logs.search'),
            onChange: (event) => setSearch(event.target.value),
          }),
          h(Button, { variant: 'secondary', small: true, onClick: download, disabled: !logText }, t('logs.download'))
        ),
        h('pre', { className: 'xwm-log', ref: preRef, onScroll }, logText || t('logs.empty')),
        h('div', { className: 'xwm-log-meta' },
          t('logs.lines', { shown: shown.length, total: lineCount }) +
          (lineCount < 200 ? ' · ' + t('logs.tailNote', { count: lineCount }) : '')
        )
      );
    }

    function SettingsForm({ settings, onChange, t }) {
      const [roundsText, setRoundsText] = useState(String(settings.rounds));
      const [followsText, setFollowsText] = useState(String(settings.maxNewFollows));
      const [error, setError] = useState('');
      useEffect(() => {
        setRoundsText(String(settings.rounds));
        setFollowsText(String(settings.maxNewFollows));
      }, [settings.rounds, settings.maxNewFollows]);
      const emit = (roundsValue, followsValue) => {
        const rounds = Number.parseInt(roundsValue, 10);
        const follows = Number.parseInt(followsValue, 10);
        if (Number.isFinite(rounds) && rounds >= 1 && rounds <= 10 &&
            Number.isFinite(follows) && follows >= 0 && follows <= 100) {
          setError('');
          onChange({ rounds, maxNewFollows: follows });
        }
      };
      const commit = () => {
        const rounds = Number.parseInt(roundsText, 10);
        const follows = Number.parseInt(followsText, 10);
        if (!Number.isFinite(rounds) || rounds < 1 || rounds > 10) {
          setError(t('settings.invalidRounds'));
          return;
        }
        if (!Number.isFinite(follows) || follows < 0 || follows > 100) {
          setError(t('settings.invalidFollows'));
          return;
        }
        setError('');
        setRoundsText(String(rounds));
        setFollowsText(String(follows));
        onChange({ rounds, maxNewFollows: follows });
      };
      return h('div', null,
        h('div', { className: 'xwm-settings-grid' },
          h('div', { className: 'xwm-field' },
            h('label', { htmlFor: 'xwm-rounds' }, t('settings.rounds')),
            h('input', {
              id: 'xwm-rounds',
              className: 'xwm-input',
              type: 'number',
              min: 1,
              max: 10,
              step: 1,
              value: roundsText,
              onInput: (event) => {
                setRoundsText(event.target.value);
                emit(event.target.value, followsText);
              },
              onBlur: commit,
            }),
            h('span', { className: 'xwm-field-hint' }, t('settings.roundsHint'))
          ),
          h('div', { className: 'xwm-field' },
            h('label', { htmlFor: 'xwm-max-follows' }, t('settings.maxNewFollows')),
            h('input', {
              id: 'xwm-max-follows',
              className: 'xwm-input',
              type: 'number',
              min: 0,
              max: 100,
              step: 1,
              value: followsText,
              onInput: (event) => {
                setFollowsText(event.target.value);
                emit(roundsText, event.target.value);
              },
              onBlur: commit,
            }),
            h('span', { className: 'xwm-field-hint' }, t('settings.maxNewFollowsHint'))
          )
        ),
        h('div', { className: 'xwm-field-hint', style: { marginTop: 10 } }, t('settings.perRound', { count: PER_ROUND })),
        error ? h('div', { className: 'xwm-error-box', style: { marginTop: 10 } }, error) : null
      );
    }

    function SettingsDialog({ settings, onChange, onClose, opener, t }) {
      const dialogRef = useRef(null);
      useEffect(() => {
        const dialog = dialogRef.current;
        const controls = dialog.querySelectorAll('button, input');
        const first = controls[0];
        const last = controls[controls.length - 1];
        const onKey = (event) => {
          if (event.key === 'Escape') {
            onClose();
            return;
          }
          if (event.key !== 'Tab') return;
          const active = document.activeElement;
          if (!dialog.contains(active) || active === (event.shiftKey ? first : last)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
          }
        };
        document.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.querySelector('input').focus();
        return () => {
          document.removeEventListener('keydown', onKey);
          document.body.style.overflow = previous;
          opener?.focus();
        };
      }, [onClose, opener]);
      return ReactDOM.createPortal(
        h('div', { className: 'xwm-overlay', onMouseDown: (event) => { if (event.target === event.currentTarget) onClose(); } },
          h('div', { ref: dialogRef, className: 'xwm-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settings.title') },
            h('div', { className: 'xwm-dialog-head' },
              h('div', { className: 'xwm-dialog-title' }, t('settings.title')),
              h(Button, { variant: 'ghost', small: true, onClick: onClose, ariaLabel: t('button.close') }, '✕')
            ),
            h('div', { className: 'xwm-dialog-body' },
              h(SettingsForm, { settings, onChange, t }),
              h('div', { className: 'xwm-field-hint', style: { marginTop: 14, lineHeight: 1.7 } }, t('settings.note'))
            ),
            h('div', { className: 'xwm-dialog-foot' },
              h(Button, { variant: 'primary', onClick: onClose }, t('button.done'))
            )
          )
        ),
        document.body
      );
    }

    // ---------------------------------------------------------------------
    // Page
    // ---------------------------------------------------------------------
    const SETTINGS_KEY = 'xwm:settings:' + NS;

    function loadSettings() {
      try {
        const raw = window.localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { rounds: 3, maxNewFollows: 0 };
        const parsed = JSON.parse(raw);
        const rounds = Number.parseInt(parsed.rounds, 10);
        const maxNewFollows = Number.parseInt(parsed.maxNewFollows, 10);
        return {
          rounds: Number.isFinite(rounds) ? Math.min(10, Math.max(1, rounds)) : 3,
          maxNewFollows: Number.isFinite(maxNewFollows) ? Math.min(100, Math.max(0, maxNewFollows)) : 0,
        };
      } catch (err) {
        return { rounds: 3, maxNewFollows: 0 };
      }
    }

    function ServiceManagement({ statusFeed, controlApi, statusConnected, t }) {
      const [starting, setStarting] = useState(false);
      const [errors, setErrors] = useState({});
      const inFlight = useRef(false);
      const statusOffline = !statusFeed.loading && !statusConnected;
      const controlOffline = !controlApi.loading && !controlApi.connected;
      const offline = statusOffline || controlOffline;
      const detail = [statusOffline && errors.status, controlOffline && errors.control].filter(Boolean).join(' · ');
      useEffect(() => {
        setErrors((previous) => {
          if (!(statusConnected && previous.status) && !(controlApi.connected && previous.control)) return previous;
          return { status: statusConnected ? undefined : previous.status, control: controlApi.connected ? undefined : previous.control };
        });
      }, [statusConnected, controlApi.connected]);
      const startLabel = statusOffline && controlOffline ? 'services.start'
        : statusOffline ? 'services.startStatus' : 'services.startControl';

      const startServices = async () => {
        if (inFlight.current || !offline) return;
        inFlight.current = true;
        setStarting(true);
        const services = [statusOffline && 'status', controlOffline && 'control'].filter(Boolean);
        const refresh = { status: statusFeed.refresh, control: controlApi.refresh };
        setErrors({});
        try {
          const response = await fetch(new URL(SERVICE_START_ENDPOINT, document.baseURI), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ services }),
            redirect: 'error',
            signal: AbortSignal.timeout(20000),
          });
          const payload = await response.json().catch(() => null);
          if (!payload?.services) throw new Error(payload?.error || `HTTP ${response.status}`);
          const failures = await Promise.all(services.map(async (id) => {
            if (await refresh[id]()) return [id, undefined];
            return [id, payload.services[id]?.error || t('services.unreachable', { service: t('services.' + id) })];
          }));
          setErrors(Object.fromEntries(failures));
        } catch (err) {
          setErrors(Object.fromEntries(services.map((id) => [id, err.message || String(err)])));
        } finally {
          inFlight.current = false;
          setStarting(false);
        }
      };

      const indicator = (key, port, loading, connected) => {
        const state = loading ? 'checking' : connected ? 'running' : 'offline';
        const color = loading ? T.muted : connected ? T.green : T.red;
        return h('span', { className: 'xwm-service-state' },
          h('span', { className: 'xwm-pill-dot', 'aria-hidden': true, style: { background: color } }),
          t('services.' + state, { service: t(key) }) + ' · ' + port
        );
      };

      return h('section', { className: 'xwm-services', 'aria-label': t('services.title') },
        h('div', { className: 'xwm-services-row' },
          h('div', { className: 'xwm-service-states', role: 'status' },
            h('strong', null, t('services.title')),
            indicator('services.status', 8787, statusFeed.loading, statusConnected),
            indicator('services.control', 8788, controlApi.loading, controlApi.connected)
          ),
          starting || offline ? h(Button, { variant: 'primary', small: true, disabled: starting, onClick: startServices },
            t(starting ? 'button.starting' : startLabel)
          ) : null
        ),
        detail ? h('p', { className: 'xwm-service-error', role: 'alert' }, t('services.failed', { detail })) : null
      );
    }

    function WorkflowPage({ t }) {
      const tr = typeof t === 'function' ? t : (key) => key;
      const statusFeed = useStatusFeed();
      const controlApi = useControlStatus();
      const statusConnected = !statusFeed.loading && !statusFeed.error && !!statusFeed.data;
      const [settings, setSettings] = useState(loadSettings);
      const [settingsOpener, setSettingsOpener] = useState(null);
      const closeSettings = useCallback(() => setSettingsOpener(null), []);
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [pendingAction, setPendingAction] = useState('');
      const [actionError, setActionError] = useState('');
      const [toast, setToast] = useState('');

      const control = controlApi.control;
      const running = !!(control && control.running);
      const now = useNow(running);
      const runId = control && control.run_id ? String(control.run_id) : '';
      const actionsUrl = ACTIONS_ENDPOINT + '?limit=100' + (runId ? '&run_id=' + encodeURIComponent(runId) : '');
      const actionsApi = useOptionalEndpoint(actionsUrl, 15000, statusConnected);
      const runsApi = useOptionalEndpoint(RUNS_ENDPOINT + '?limit=10', OPTIONAL_POLL_MS, statusConnected);
      const pendingApi = useOptionalEndpoint(PENDING_ENDPOINT + '?limit=100', OPTIONAL_POLL_MS, statusConnected);

      const vm = useMemo(() => buildViewModel({
        statusFeed,
        control,
        controlConnected: controlApi.connected,
        actionsData: actionsApi.data,
        runsData: runsApi.data,
        pendingData: pendingApi.data,
        now,
      }), [statusFeed, control, controlApi.connected, actionsApi.data, runsApi.data, pendingApi.data, now]);

      useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(''), 2600);
        return () => clearTimeout(timer);
      }, [toast]);

      const saveSettings = useCallback((next) => {
        setSettings(next);
        try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (err) { /* ignore */ }
      }, []);

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
        if (!controlApi.connected || running || pendingAction) return;
        setPendingAction(dryRun ? 'dry' : 'run');
        setActionError('');
        try {
          const { res, payload } = await post(CONTROL_RUN_ENDPOINT, {
            rounds: settings.rounds,
            max_checks: PER_ROUND,
            max_new_follows: settings.maxNewFollows,
            dry_run: dryRun,
          });
          const message = payload && (payload.message || payload.error);
          if (res.status === 409 || message === 'already_running') {
            if (payload && payload.control) controlApi.adopt(payload.control);
            setActionError(tr('error.alreadyRunning'));
            return;
          }
          if (!res.ok || !payload || payload.ok !== true) {
            setActionError(tr('error.startFailed', { detail: message || ('HTTP ' + res.status) }));
            return;
          }
          if (payload.control) controlApi.adopt(payload.control);
          await controlApi.refresh();
          setToast(dryRun ? tr('toast.dryStarted') : tr('toast.started'));
        } catch (err) {
          setActionError(tr('error.controlUnavailable'));
        } finally {
          setPendingAction('');
        }
      };

      const stop = async () => {
        if (!controlApi.connected || !running || pendingAction) return;
        setPendingAction('stop');
        setActionError('');
        try {
          const { res, payload } = await post(CONTROL_STOP_ENDPOINT, {});
          const message = payload && (payload.message || payload.error);
          if (res.status === 409 || message === 'not_running') {
            if (payload && payload.control) controlApi.adopt(payload.control);
            setActionError(tr('error.notRunning'));
            return;
          }
          if (!res.ok || !payload || payload.ok !== true) {
            setActionError(tr('error.stopFailed', { detail: message || ('HTTP ' + res.status) }));
            return;
          }
          if (payload.control) controlApi.adopt(payload.control);
          await controlApi.refresh();
          setToast(tr('toast.stopped'));
        } catch (err) {
          setActionError(tr('error.controlUnavailable'));
        } finally {
          setPendingAction('');
        }
      };

      const copyHandle = async (handle) => {
        try {
          await navigator.clipboard.writeText('@' + handle);
          setToast(tr('toast.copied', { handle }));
        } catch (err) {
          try {
            const area = document.createElement('textarea');
            area.value = '@' + handle;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
            setToast(tr('toast.copied', { handle }));
          } catch (inner) {
            setActionError(tr('error.noClipboard'));
          }
        }
      };

      const runningNow = running || vm.status === 'running';
      const canStart = controlApi.connected && !runningNow && !pendingAction;
      const canStop = controlApi.connected && runningNow && !pendingAction;
      const account = vm.account;

      let subtitle = tr('header.noRun');
      if (vm.status === 'disconnected') {
        subtitle = tr('header.controlDown');
      } else if (vm.status === 'running') {
        subtitle = tr('header.runningLine', {
          index: vm.roundIndex == null ? '—' : vm.roundIndex,
          total: vm.roundsPlanned == null ? '—' : vm.roundsPlanned,
          checked: vm.checked,
          max: vm.maxChecks,
          elapsed: formatDuration(vm.elapsed),
          eta: vm.eta == null ? tr('header.etaPending') : tr('header.eta', { duration: formatDuration(vm.eta) }),
        });
      } else if (vm.status === 'idle' && vm.startedAt) {
        subtitle = tr('header.lastRun', {
          start: formatClock(vm.startedAt),
          end: formatClock(vm.endedAt),
          duration: formatDuration(vm.elapsed),
        });
      } else if (vm.roundIndex != null && vm.startedAt) {
        subtitle = tr('header.roundLine', {
          index: vm.roundIndex,
          total: vm.roundsPlanned == null ? '—' : vm.roundsPlanned,
          checked: vm.checked,
          max: vm.maxChecks,
          elapsed: formatDuration(vm.elapsed),
        });
        const reason = describeStopReason(tr, vm.stopReasonRaw, vm.log.stop);
        if (reason) subtitle += ' · ' + tr('header.stopReason', { reason });
      } else if (vm.startedAt) {
        subtitle = tr('header.lastRun', {
          start: formatClock(vm.startedAt),
          end: formatClock(vm.endedAt),
          duration: formatDuration(vm.elapsed),
        });
        const reason = describeStopReason(tr, vm.stopReasonRaw, vm.log.stop);
        if (reason) subtitle += ' · ' + tr('header.stopReason', { reason });
      }

      const meta = statusFeed.loading
        ? tr('page.loading')
        : statusFeed.data
          ? (vm.dataAge != null ? tr('page.updatedAge', { time: formatClock(vm.dataUpdatedAt) || '—', age: vm.dataAge }) : tr('page.updated', { time: formatClock(vm.dataUpdatedAt) || '—' }))
          : tr('page.offline');

      return h('div', { className: 'xwm-page' },
        h('style', null, CSS),
        h('header', { className: 'xwm-topbar' },
          h('div', { className: 'xwm-topbar-row' },
            h('div', { className: 'xwm-title-block' },
              h('div', { className: 'xwm-title-line' },
                h('span', { className: 'xwm-pill-dot', style: { width: 9, height: 9, background: statusColor(vm.status) } }),
                h('h1', { className: 'xwm-title' }, tr('page.title')),
                account ? h('span', { className: 'xwm-account' }, '@' + account) : null,
                h(StatusPill, { status: vm.status, t: tr })
              ),
              h('div', { className: 'xwm-subtitle' }, subtitle),
              h('div', { className: 'xwm-meta' },
                meta,
                h('span', { style: { marginLeft: 8, opacity: .85 } }, vm.mode === 'v2' ? tr('page.sourceV2') : tr('page.sourceLegacy')),
                h('span', { style: { marginLeft: 8, opacity: .9 } }, tr('page.todaySummary', {
                  follow: valueOr(vm.today.follow), like: valueOr(vm.today.like), reply: valueOr(vm.today.reply),
                }))
              )
            ),
            h('div', { className: 'xwm-actions' },
              h(Button, { variant: 'secondary', onClick: (event) => setSettingsOpener(event.currentTarget), title: tr('settings.summary', { rounds: settings.rounds, perRound: PER_ROUND, maxNewFollows: settings.maxNewFollows }) }, tr('button.settings')),
              h(Button, { variant: 'primary', disabled: !canStart, onClick: () => start(false) }, pendingAction === 'run' ? tr('button.starting') : tr('button.start')),
              h(Button, { variant: 'secondary', disabled: !canStart, onClick: () => start(true) }, pendingAction === 'dry' ? tr('button.starting') : tr('button.dryRun')),
              h(Button, { variant: 'danger', disabled: !canStop, onClick: stop }, pendingAction === 'stop' ? tr('button.stopping') : tr('button.stop'))
            )
          ),
          h(ServiceManagement, { statusFeed, controlApi, statusConnected, t: tr })
        ),
        h('div', { className: 'xwm-scroll' },
          h('div', { className: 'xwm-content' },
            actionError ? h('div', { className: 'xwm-banner', role: 'alert' }, h('span', null, actionError)) : null,
            h('div', { className: 'xwm-status-wrap' },
              h(ProgressPanel, { vm, t: tr })
            ),
            h('div', { className: 'xwm-grid' },
              h('div', { className: 'xwm-col' },
                h(TargetTable, { vm, t: tr, maxRows: DEFAULT_TABLE_ROWS, showViewAll: true, onViewAll: () => setDrawerOpen(true) })
              ),
              h('div', { className: 'xwm-col' },
                h(PendingCard, { vm, t: tr, onCopy: copyHandle }),
                h(RunInfoCard, { vm, t: tr }),
                h(SafetyCard, { vm, t: tr })
              )
            ),
            h(RunHistoryCard, { vm, t: tr }),
            h(ReplyAuditCard, { vm, t: tr }),
            h(Section, { t: tr, title: tr('logs.title'), subtitle: tr('logs.subtitle'), defaultOpen: false },
              h(LogPanel, { vm, t: tr })
            )
          )
        ),
        settingsOpener ? h(SettingsDialog, { settings, onChange: saveSettings, onClose: closeSettings, opener: settingsOpener, t: tr }) : null,
        drawerOpen ? h(ViewAllDrawer, { vm, t: tr, onClose: () => setDrawerOpen(false) }) : null,
        toast ? h('div', { className: 'xwm-toast', role: 'status' }, toast) : null
      );
    }

    // ---------------------------------------------------------------------
    // Panel icon + plugin registration (unchanged slot structure)
    // ---------------------------------------------------------------------
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
