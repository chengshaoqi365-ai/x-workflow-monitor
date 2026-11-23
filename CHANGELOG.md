# Changelog

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
