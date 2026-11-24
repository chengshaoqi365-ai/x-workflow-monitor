# 插件验收记录

## 0.5.0（2026-11-24）

- 插件：`@local/x-workflow-monitor` 0.5.0
- 工作区：`/Users/shaoqicheng/Documents/x 自动化 /x-workflow-monitor`
- 本轮改动：`client.js` 重构为「运行详情 + 待办队列」；版本号、CHANGELOG、README、DETAIL、语言资源同步。

### 静态

- [x] `npm run validate` 通过
- [x] `node --check client.js` 通过
- [x] 仍注册在 `sidebar.panellist` + `main`，注册结构未变
- [x] 未新增 Playwright / Patchright / CDP / 远程调试依赖或启动参数
- [x] 未修改 `x-desktop-auto/` 任何文件、数据库或控制服务 API

验证输出（0.5.0）：

```text
> @local/x-workflow-monitor@0.5.0 validate
> node scripts/validate.mjs

plugin manifest ok
client.js / index.js / validate.mjs syntax ok
no Playwright / CDP / remote-debugging dependency or flag
control service endpoints present
```

### 渲染与交互（jsdom，49 项断言）

- [x] 控制服务未连接时显示原文 `控制服务未启动，请在 x-desktop-auto 运行 bash scripts/start_control_server.sh`
- [x] 状态服务未连接时显示 `状态服务未连接。在 x-desktop-auto 目录运行：python3 scripts/status_server.py`
- [x] 运行 / 已完成 / 已停止 / 失败 / 未运行状态 pill 正确
- [x] 旧接口回退：从 `control.log_tail` 推断当前目标与失败行，显示 `@desteffiong`、`回复失败：回复框未关闭（still_open）`
- [x] v2 契约 fixture：本次第 2/3 轮、17/30、12 行目标表默认 10 行、查看全部抽屉 12 行
- [x] 失败行展开显示推文摘要 / 失败详情 / 尝试次数 / 时间
- [x] `chrome_clean === null` 显示“未检测”，`false` 显示“异常”，均不显示 CLEAN
- [x] 今日计数不出现“限额 / 剩余额度 / 配额”
- [x] 待处理列表只读，只有复制 `@handle`
- [x] 原始日志默认折叠，打开后有自动跟随 / 只看错误 / 搜索 / 下载
- [x] 开始 / dry-run / 停止按运行状态禁用；开始请求带 `rounds`、`max_checks:30`、`max_new_follows`、`dry_run`
- [x] 409 `already_running` 显示「已有任务在运行」

### 截图

- [1280×800](1280x800.png)
- [1440×900](1440x900.png)

### 阻塞项（不自行改后端）

1. `GET /status/v2`、`GET /actions`、`GET /runs`、`GET /pending` 尚未上线（2026-11-24 22:00 探测均为 404）。页面已按契约实现适配层，接口就绪后会直接切换；当前显示“未接入”空态。
2. 控制服务 `log_tail` 只保留最近 40 行，无法满足 200 行日志要求；需要后端扩大 tail 或提供日志分页。
3. 旧 `/status` 不返回账号时区、平台告警、出口、失败 / 跳过今日计数；当前显示“未接入 / 未监测”，不伪造。
4. `actions.run_id` 与 `control.run_id` 历史上存在不一致，`/actions?run_id=` 可能查不到本轮；需按 docs/24 §5.4 统一后才能真正展示逐目标明细。

- 插件：`@local/x-workflow-monitor` 0.4.0
- 验证时间：2026-11-24 02:32 – 02:58（Asia/Shanghai）
- 工作区：`/Users/shaoqicheng/Documents/x 自动化 /x-workflow-monitor`

## 静态

- [x] `npm run validate` 通过
- [x] `node --check client.js` 通过
- [x] 插件仍注册在 `sidebar.panellist`，不新增 composer dock
- [x] 不新增 Playwright / Patchright / CDP / 远程调试依赖
- [x] 不读取/修改 X DOM（client.js 只有本插件自己的日志滚动 ref，无任何 X 页面查询）

验证输出：

```text
> @local/x-workflow-monitor@0.4.0 validate
> node scripts/validate.mjs

plugin manifest ok
client.js / index.js / validate.mjs syntax ok
no Playwright / CDP / remote-debugging dependency or flag
control service endpoints present
```

补充语法检查：

```text
$ node --check client.js
$ echo $?
0
```

## 控制服务

| 项 | 结果 | 证据 |
| --- | --- | --- |
| 控制服务未启动时，页面明确显示未连接 | 通过（客户端渲染） | jsdom 渲染测试：控制服务 fetch 失败时显示原文 `控制服务未启动，请在 x-desktop-auto 运行 bash scripts/start_control_server.sh` |
| 启动 dry-run（1 轮 / 1 个 id）后 2 秒内显示 running | 通过（接口时序） | `POST /control/run {rounds:1,max_checks:1,dry_run:true}` 返回 200 `{ok:true,message:"started"}`；立即 `GET /control/status` 为 `running=true`；页面每 2 秒轮询 |
| 进程结束后显示 `exit_code=0` | 未验证 | 本机 `agent-desktop list-apps` 依赖的 `ps` 被 macOS 拒绝（`ps: Operation not permitted`），dry-run 在页面导航阶段无法完成；需在有完整桌面权限的验收会话执行 1 轮真实 dry-run |
| 运行中再次点开始返回 409，UI 不重复启动 | 通过 | 运行中再次 `POST /control/run` 返回 `409 {ok:false,message:"already_running"}`；jsdom 测试 409 场景显示「已有任务在运行」 |
| 点停止后进程退出，`running=false`，无残留 Python | 通过 | `POST /control/stop` 返回 200 `{message:"stopped",exit_code:-15}`；随后 `running=false`、`ended_at` 有值；`pgrep -fl "src.main connect"` 无输出 |
| `log_tail` 能看到流程输出 | 通过 | 停止后 `log_tail` 含「进程级检查」「CLEAN: 主 Chrome 进程无自动化/调试参数」「agent-desktop 权限 OK」「connect 流程（dry-run，不点击）」 |

## UI

以下各项由本地 jsdom + React 渲染冒烟测试逐项断言（24 项全部通过；测试脚本只读加载 `client.js`，mock `fetch`，不依赖 DSH 页面）：

- [x] 轮数默认 3，范围 1-10（input `min=1 max=10`，默认值 `3`，提交前 clamp）
- [x] 页面显示「每轮 30 个 id」
- [x] 进度卡片显示 `round`、`checked`、`new_follows`、`likes`、`replies`
- [x] 页面刷新后能恢复为服务端真实状态（首次挂载立即 GET `/control/status`，每 2 秒轮询）
- [x] 停止/完成/失败三种状态视觉上可区分（橙 / 绿 / 红三种状态 pill，运行中为蓝色）
- [x] 运行中「开始运行」「dry-run」禁用，「停止」可用
- [x] `dry-run` 按钮提交 `dry_run=true`；`开始运行` 提交 `dry_run=false`、`max_checks=30`
- [x] 控制服务断开时保留业务状态页，运行控制卡片内显示重试按钮
- [x] 日志只保留最近 20 行，等宽字体、可滚动
- [x] DSH 左侧栏 **X 工作流** 入口已在实际窗口中显示（用户截图确认，2026-11-24 02:54）

冒烟测试命令（测试环境位于 `/tmp/xwm-test`，不属于插件仓库）：

```bash
node /tmp/xwm-test/test-client.mjs "/Users/shaoqicheng/Documents/x 自动化 /x-workflow-monitor/client.js"
# 24 项 PASS，all client smoke tests passed
```

## 真实流程（由当前会话验收）

- [ ] 1 个真实账号：关注 / 按概率点赞 / 回复成功（用户确认后）
- [ ] 3 轮 × 30 的完整运行由用户确认后执行
- [ ] Chrome 进程检查必须 CLEAN

## 未验证与限制

1. 本次验证环境的 `agent-desktop` 受 macOS `ps` 权限限制，dry-run 无法完成页面导航，所以 `exit_code=0` 这一条未在本轮验证；控制服务的启动、停止、409、日志链路均已单独验证。
2. DSH 页面视觉效果以用户实际打开的「X 工作流」页面为准；插件客户端已用真实 React 渲染验证结构与交互，未在本轮通过截图验收 DSH 容器内的最终样式。
3. 真实 X 操作（关注/点赞/回复）不在本轮执行范围，按任务书由当前会话在用户确认后验收。
