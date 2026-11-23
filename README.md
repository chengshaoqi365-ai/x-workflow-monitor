# x-workflow-monitor

一个 DSH Web 插件：在左侧栏提供 **X 工作流** 入口，点击打开完整页面。页面包含只读的业务状态监控，以及启动 / 停止本机 `x-desktop-auto` connect 流程的「运行控制」。

## 显示内容

从左侧栏点击 **X 工作流** 打开完整面板。

- **安全门**：正常 Chrome 进程是否 `CLEAN`（无自动化/调试参数）
- **Connect 发现**：已保存的 connect 相关帖子数量
- **候选人**：`new / skipped` 数量
- **今日动作**：点赞 / 回复 / 关注次数
- **最近发现**：最近 6 条帖子
- **最近候选人**：最近 6 个主页筛选结果

## 运行控制

- **轮数**：1–10，默认 3；固定「每轮 30 个 id」
- **开始运行**：真实执行 connect 流程（红色主按钮）
- **dry-run**：只检查页面，不点击关注 / 点赞 / 回复
- **停止**：终止正在运行的流程
- **状态卡**：运行状态、当前轮次、本轮检查、新关注、点赞、回复、退出码
- **运行日志**：显示控制服务 `log_tail` 最近 20 行
- **错误提示**：控制服务未启动、已有任务在运行、启动/停止失败

插件只做 UI 和 HTTP 调用：不直接操作 Chrome DOM，不启动 Python，不直接调用 X。所有 X 操作由 `x-desktop-auto` 的 Python 控制服务执行。

## 依赖服务

业务状态服务（只读，每 5 秒）：

```text
http://127.0.0.1:8787/status
```

控制服务（每 2 秒轮询，提供 run / stop）：

```text
http://127.0.0.1:8788/control/status
```

在 `x-desktop-auto` 项目里启动：

```bash
cd x-desktop-auto
./scripts/start_status_server.sh
bash scripts/start_control_server.sh
```

状态服务读取 `x-desktop-auto/data/state.db`，不修改任何数据。控制服务只绑定 `127.0.0.1:8788`。

## 安装

1. 启动上述两个本机服务。
2. 打开 DSH Web → **插件**。
3. **添加插件 → 安装第三方插件**。
4. 输入本地目录的绝对路径，例如：

```text
/path/to/x-workflow-monitor
```

5. 安装后选择 **立即启用**。
6. 刷新页面后，左侧栏出现 **X 工作流**，点击打开看板。

### 更新已安装的旧版本

插件目录是通过 `link:` 方式加入 profile 的，修改文件即生效：

1. **插件**页确认 `@local/x-workflow-monitor` 已启用。
2. 在 DSH Web 按 `Cmd+Shift+R` 硬刷新（`client.js` 会被 HMR 重新加载）。
3. 若左侧栏没有出现 **X 工作流**，重启 `dsh web` 后再刷新一次。

## 开发

```bash
node --check client.js
node --check index.js
npm run validate
```

插件结构：

```text
package.json          DSH 插件 manifest + bundle 配置
cordis.patch.yml      Host 插件行
index.js              Host 半部分（空）
client.js             左侧栏完整页面（状态 + 运行控制）
locale/zh.json        中文展示元信息
locale/en.json        英文展示元信息
docs/DETAIL.md        插件详情页文档
docs/PLUGIN_ACCEPTANCE.md  验收清单
icon.svg              插件图标
scripts/validate.mjs  本地校验脚本
```

## 说明

实际互动动作仍由 `x-desktop-auto` 在明确确认后执行；插件只通过控制服务发起，不绕过控制服务的单实例锁。
