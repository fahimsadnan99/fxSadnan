"""Merge ForexFactory's weekly calendar export into per-month JSON files.

Run from the root of the `ff-data` branch checkout. Writes months/YYYY-MM.json:
  {"updated": iso, "weeks": [[first, last], ...], "events": [{date, country, impact, title, forecast, previous}]}
`weeks` lists the date ranges the feed covered, so the site knows where real data replaces its estimates.
"""

import json
import pathlib
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

FEED = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
FIELDS = ("date", "country", "impact", "title", "forecast", "previous")


def fetch():
    # A local file path as the first argument replaces the feed (for testing).
    if len(sys.argv) > 1:
        rows = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    else:
        req = urllib.request.Request(FEED, headers={"User-Agent": "fxsadnan-calendar/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                rows = json.load(res)
        except urllib.error.HTTPError as err:
            if err.code == 429:
                print("Feed rate-limited this run; the next scheduled run will try again")
                raise SystemExit(0)
            raise
    if not isinstance(rows, list) or not rows:
        raise SystemExit("Feed returned no events")
    return [{k: (row.get(k) or "") for k in FIELDS} for row in rows]


def month_keys(iso):
    # An event late on the last day (New York time) is already the next day in Asia, so file it in both months.
    d = datetime.fromisoformat(iso).date()
    return {d.strftime("%Y-%m"), (d + timedelta(days=1)).strftime("%Y-%m")}


def main():
    events = fetch()
    first = min(datetime.fromisoformat(e["date"]).date() for e in events)
    sunday = first - timedelta(days=(first.weekday() + 1) % 7)
    week = [sunday.isoformat(), (sunday + timedelta(days=6)).isoformat()]

    by_month = {}
    for e in events:
        for key in month_keys(e["date"]):
            by_month.setdefault(key, []).append(e)

    out = pathlib.Path("months")
    out.mkdir(exist_ok=True)
    for key, fresh in by_month.items():
        path = out / f"{key}.json"
        data = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"weeks": [], "events": []}
        ident = lambda e: (e["date"], e["country"], e["title"])
        merged = {ident(e): e for e in data["events"]}
        merged.update({ident(e): e for e in fresh})
        weeks = sorted(list(w) for w in {tuple(w) for w in data["weeks"]} | {tuple(week)})
        merged = sorted(merged.values(), key=lambda e: e["date"])
        if weeks == data["weeks"] and merged == data["events"]:
            print(f"{path}: unchanged")
            continue
        data = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "weeks": weeks, "events": merged}
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{path}: {len(merged)} events")


if __name__ == "__main__":
    main()
