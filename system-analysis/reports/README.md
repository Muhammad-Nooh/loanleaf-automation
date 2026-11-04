# Historical QA Reports

The `YYYY/MM/<UTC timestamp>-<process id>/` directories are created by the
`npm run qa` commands. Each run contains:

- `report.json` — selection, dependencies, tests, baseline comparisons,
  potential regressions, blockers, recommendations, and screenshot links.
- `*-baseline-candidate.json` — sanitized API/UI observations proposed for
  review; these are not approved baselines.
- `observations/` — sanitized per-screen API/UI records and text-masked
  screenshots.

Reports are historical evidence. The runner does not edit approved baseline
files or discard earlier reports. Failed test executions are recorded in the
run report and returned with a non-zero exit status.
