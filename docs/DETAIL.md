# X 自动化工作流监控

在 DSH **左侧栏**注册 **X 工作流** 入口，打开完整状态页；对话输入区下方同时显示一块紧凑看板：

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

默认地址：`http://127.0.0.1:8787/status`。插件只读取状态，不执行关注/点赞/回复。
