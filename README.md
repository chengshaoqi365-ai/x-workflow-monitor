# x-workflow-monitor

一个 DSH Web 插件：在对话输入区下方显示 **X 自动化工作流** 的实时状态。

## 显示内容

- **安全门**：正常 Chrome 进程是否 `CLEAN`（无自动化/调试参数）
- **Connect 发现**：已保存的 connect 相关帖子数量
- **候选人**：`new / skipped` 数量
- **今日动作**：点赞 / 回复 / 关注次数
- **最近发现**：最近 6 条帖子
- **最近候选人**：最近 6 个主页筛选结果

插件是只读的，不会执行关注/点赞/回复。

## 依赖状态服务

插件每 5 秒读取一次本机状态：

```text
http://127.0.0.1:8787/status
```

在 `x-desktop-auto` 项目里启动：

```bash
cd x-desktop-auto
./scripts/start_status_server.sh
# 或
python3 scripts/status_server.py
```

服务读取 `x-desktop-auto/data/state.db`，不修改任何数据。

## 安装

1. 保持状态服务运行。
2. 打开 DSH Web → **插件**。
3. **添加插件 → 安装第三方插件**。
4. 输入本地目录的绝对路径，例如：

```text
/path/to/x-workflow-monitor
```

5. 安装后选择 **立即启用**。
6. 回到有会话的页面，输入框下方会出现看板。

## 开发

```bash
node --check client.js
node --check index.js
```

插件结构：

```text
package.json          DSH 插件 manifest + bundle 配置
cordis.patch.yml      Host 插件行
index.js              Host 半部分（空）
client.js             对话输入区看板
locale/zh.json        中文展示元信息
locale/en.json        英文展示元信息
docs/DETAIL.md        插件详情页文档
icon.svg              插件图标
```

## 说明

这是 X 自动化项目的只读监控面板；实际互动动作仍由 `x-desktop-auto` 在明确确认后执行。
