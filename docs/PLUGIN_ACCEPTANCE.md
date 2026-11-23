# 插件验收记录

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
