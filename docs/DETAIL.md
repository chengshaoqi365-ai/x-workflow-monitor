# X 自动化工作流监控

在 DSH **左侧栏**注册 **X 工作流** 入口，点击打开完整页面。页面由两块组成：只读的业务状态监控，以及通过本机控制服务启动 / 停止 connect 流程的「运行控制」。

## 业务状态（只读）

- **安全门**：当前 Chrome 是否仍是正常进程、没有自动化启动参数
- **Connect 发现**：已保存的 connect 相关帖子数
- **候选人筛选**：`new / skipped / done` 数量
- **今日动作**：点赞、回复、关注次数
- **最近发现 / 最近候选人**：显示最近几条实际记录

数据来自本机 `x-desktop-auto` 的只读状态服务：

```bash
cd x-desktop-auto
python3 scripts/status_server.py
```

默认地址：`http://127.0.0.1:8787/status`，每 5 秒刷新一次。

## 运行控制

「运行控制」卡片通过本机控制服务操作 connect 流程：

| 操作 | 请求 |
| --- | --- |
| 读取状态（每 2 秒） | `GET http://127.0.0.1:8788/control/status` |
| 开始运行 | `POST http://127.0.0.1:8788/control/run` `{rounds, max_checks: 30, dry_run: false}` |
| dry-run | 同上，`dry_run: true`（只读取页面，不点击） |
| 停止 | `POST http://127.0.0.1:8788/control/stop` `{}` |

- 轮数：1–10，默认 3，产品上固定「每轮 30 个 id」
- 运行中「开始运行」「dry-run」禁用，「停止」可用；结束后恢复
- 状态卡显示运行状态、当前轮次、本轮检查、新关注、点赞、回复、退出码
- 日志显示 `log_tail` 最近 20 行，等宽字体，可滚动
- 控制服务未启动时显示明确提示；409 `already_running` 显示「已有任务在运行」；启动失败显示服务返回的 `error` / `message`

插件只做 UI 与 HTTP 调用，不直接操作 Chrome DOM，不启动 Python，也不直接调用 X。所有 X 操作由 `x-desktop-auto` 的 Python 控制服务执行。

启动控制服务：

```bash
cd x-desktop-auto
bash scripts/start_control_server.sh
```
