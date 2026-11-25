# Changelog

## 0.6.2

- Move the X Workflow entry from the sidebar to the conversation toolbar, immediately before Pending changes. Keep a top-right entry available in blank conversations.
- Add Back to conversation and focus the workflow heading when the page opens.

## 0.6.1

- Remove the discovery and candidate pools and the duplicate Run settings section from the bottom of the dashboard. Run settings is available from the header.
- Move keyboard focus into the Run settings dialog when it opens. Keep Tab navigation inside the dialog and return focus to the header button when it closes.

## 0.6.0

- Add service management with separate status and control indicators. Start any stopped service from the dashboard and refresh its data when ready.
- Use an authenticated DSH Host endpoint to check readiness and invoke only the two fixed HTTP service startup scripts.

## 0.5.0

- Rebuild the page as **run detail + to-do queue**: fixed header, sticky progress bar, target table, pending card, run details and safety/pacing card.
- Fix the missing scrollbar: the page is now a two-container layout (`xwm-page` / `xwm-scroll`) with a visible, stable scrollbar; content max width is 1240px.
- Add a **target table** (10 latest rows by default, “查看全部” drawer shows up to 30) with per-action `✓ / — / … / ✗` marks, failed-row highlighting and expandable detail (reply text, failure reason, attempts, time).
- Add read-only **pending** list (`failed` / `never_attempted`) with copy-handle only; no retry button.
- Add **run details** (mode, planned rounds, start/end, duration, exit code, stop reason) and **safety & pacing** (browser CLEAN / not checked, platform alerts, egress, account time zone, today counts).
- Add a `/status/v2` adapter that follows the contract in `docs/24-插件UI优化任务书.md` §4; when the new endpoints are absent the UI falls back to `/status` + `/control/status` and shows explicit “not connected” empty states instead of inventing numbers. Target rows can be inferred from the run log in fallback mode.
- Add P1 run history and reply audit cards (data when `/runs` and `/actions` are available).
- Move raw log, discovery/candidate pools and run settings into P2 collapsible sections; log panel supports auto-follow (pauses when scrolled up), errors-only, search and download.
- Add a **run settings** dialog: rounds 1–10, `max_new_follows` 0–100, per-round 30 ids; dry-run is described as not written to run history.
- Add explicit `chrome_clean === null` / `false` states (“未检测 / 异常”), never display CLEAN for unknown.
- Remove the five duplicate chips, the “7 共 3 轮” mixed semantics, the first-screen 20-line log and the “今日限额” wording; exit code moves into run details.

## 0.4.0

- Add a **Run control** card to the left-sidebar **X Workflow** page: rounds input (1–10, default 3), real run, dry-run and stop buttons, plus live run status, round progress, action counters, exit code and the last 20 log lines.
- Poll the control service at `http://127.0.0.1:8788/control/status` every 2 seconds; keep the read-only workflow status at 5 seconds.
- Show explicit errors for an unavailable control service, `409 already_running` and failed start/stop responses.
- Move all visible copy into the client locale namespace (`zh` / `en`) and localize the sidebar label.

## 0.3.1

- Add connect-flow round chips: checked ids, seen handles, new follows / likes / replies.

## 0.3.0

- Show the workflow only in the left sidebar; remove the composer-dock panel.

## 0.2.0

- Add a left-sidebar **X 工作流** entry and a full workflow page.
- Keep the compact composer-dock monitor.

## 0.1.0

- Initial DSH Web plugin.
- Shows workflow gate, connect discovery count, candidate counts, action counts,
  recent discoveries, and recent candidates.
- Reads a local read-only status endpoint at `http://127.0.0.1:8787/status`.
