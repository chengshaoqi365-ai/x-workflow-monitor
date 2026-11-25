# x-workflow-monitor

一个 DSH Web 插件：在左侧栏提供 **X 工作流** 入口，点击打开 **运行详情 + 待办队列** 页面，并通过本机控制服务开始、dry-run 或停止 connect 流程。

## 首屏内容

- **运行头**：`X 自动化工作流` + `@账号`、状态 pill（运行中 / 已完成 / 已停止 / 失败 / 未运行 / 控制服务未连接）、本次轮次与进度、开始 / dry-run / 停止、运行设置
- **进度条（sticky）**：`17/30` 进度、当前目标与阶段、关注 / 点赞 / 回复 / 失败 / 跳过、最后一条人类可读事件
- **本轮目标表**：默认最近 10 行，`查看全部` 打开抽屉；每个动作用 `✓ / — / … / ✗`，失败行红色，点行展开回复原文 / 失败详情 / 尝试次数 / 时间
- **需要处理**：失败与已关注未回复列表，只读，只提供复制 `@handle`
- **本次运行**：模式、计划轮数、开始 / 结束、耗时、退出码、停止原因
- **安全与节奏**：浏览器 CLEAN / 未检测 / 异常、平台告警、出口、账号时区、今日动作计数

向下滚动可查看 **运行历史**、**回复审计** 和默认折叠的 **原始日志**。日志支持自动跟随（上滑自动暂停）、只看错误、搜索和下载。

## 运行控制

- **轮数**：1–10，默认 3；固定每轮 30 个 id
- **本次新关注数量**：0–100，0 表示不限制，收在“运行设置”弹层
- **开始运行**：真实执行 connect 流程
- **dry-run**：只检查页面，不点击关注 / 点赞 / 回复，不写入运行历史
- **停止**：终止正在运行的流程
- **错误提示**：控制服务未启动、已有任务在运行、启动 / 停止失败

页面通过本机控制服务操作 connect 流程。服务管理的启动操作由 DSH Host 调用固定脚本，只启动 HTTP 服务。

> 数据接口说明：页面优先读取 `GET /status/v2`、`/actions`、`/runs`、`/pending`（契约见 `docs/24-插件UI优化任务书.md` §4）。接口未上线时自动回退到 `GET /status` + `GET /control/status`，缺失字段显示“暂无 / 未接入”空态；回退模式下目标表会从运行日志推断可确认的信息。

## 依赖服务

业务状态服务（只读，每 5 秒）：

```text
http://127.0.0.1:8787/status
http://127.0.0.1:8787/status/v2   # 接口就绪后优先使用
http://127.0.0.1:8787/actions
http://127.0.0.1:8787/runs
http://127.0.0.1:8787/pending
```

控制服务（每 2 秒轮询，提供 run / stop）：

```text
http://127.0.0.1:8788/control/status
```

打开 **X 工作流 → 服务管理**。绿灯表示服务可连接，红灯表示当前不可连接。两个服务都离线时点击 **启动服务**，只有一个离线时按钮会显示该服务的名称。服务就绪后页面自动刷新，启动失败时显示对应脚本和探测错误。

DSH Host 只使用本机 `/Users/shaoqicheng/Documents/x 自动化 /x-desktop-auto/scripts/` 中的固定脚本。也可在终端手动启动：

```bash
cd x-desktop-auto
./scripts/start_status_server.sh
bash scripts/start_control_server.sh
```

状态服务读取 `x-desktop-auto/data/state.db`，不修改任何数据。控制服务只绑定 `127.0.0.1:8788`。

## 安装

1. 打开 DSH Web → **插件**。
2. **添加插件 → 安装第三方插件**。
3. 输入本地目录的绝对路径，例如：

```text
/path/to/x-workflow-monitor
```

4. 安装后选择 **立即启用**。
5. 刷新页面后，点击左侧栏 **X 工作流** 打开看板。

### 更新已安装的旧版本

对于通过 `link:` 安装的插件，升级到 0.6.0 后需重新加载插件的 Host 部分。支持热重载的 DSH 可通过插件管理重新应用已启用的本地组合包。如果插件管理显示需要重启，请重启 `dsh web`，再刷新原页面。

## 开发

```bash
node --check client.js
node --check index.js
npm run validate
npm test
```

插件结构：

```text
package.json          DSH 插件 manifest + bundle 配置
cordis.patch.yml      Host 插件行
index.js              Host 服务启动接口
client.js             左侧栏页面（状态、服务管理、运行控制）
locale/zh.json        中文展示元信息
locale/en.json        英文展示元信息
docs/DETAIL.md        插件详情页文档
docs/PLUGIN_ACCEPTANCE.md  验收清单
icon.svg              插件图标
scripts/validate.mjs  本地校验脚本
```

## 说明

实际互动动作仍由 `x-desktop-auto` 在明确确认后执行；插件只通过控制服务发起，不绕过控制服务的单实例锁。
