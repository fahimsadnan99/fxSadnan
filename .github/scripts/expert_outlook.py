"""Research what analysts expect from the coming high-impact news and save it for the News Impact page.

Run from the root of the `ff-data` branch checkout, after forexfactory.py. Reads months/*.json,
asks Claude (with web search) for expert previews of the next few days' high-impact events and
writes outlook/YYYY-MM.json:
  {"updated": iso, "entries": [{keys, bias, event: {bn, en}, headline: {bn, en}, summary: {bn, en},
                                 moves: [{asset, dir}], sources: [{title, url}]}]}
Each key is "YYYY-MM-DD|COUNTRY|Title" (the date as in the feed, New York time).
"""

import json
import pathlib
from datetime import date, datetime, timedelta, timezone

import anthropic

MODEL = "claude-opus-5-5"
ASSETS = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF", "CNY", "XAU", "XAG"]
DIRS = ["up", "down", "flat"]

SAVE_TOOL = {
    "name": "save_outlook",
    "description": "Save the expert outlook for every event group. Call once, at the end, with all groups.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "additionalProperties": False,
        "required": ["entries"],
        "properties": {
            "entries": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "keys", "bias", "event_bn", "event_en", "headline_bn", "headline_en",
                        "summary_bn", "summary_en", "moves", "sources",
                    ],
                    "properties": {
                        "keys": {"type": "array", "items": {"type": "string"}},
                        "bias": {"type": "string", "enum": ["up", "down", "mixed"]},
                        "event_bn": {"type": "string"},
                        "event_en": {"type": "string"},
                        "headline_bn": {"type": "string"},
                        "headline_en": {"type": "string"},
                        "summary_bn": {"type": "string"},
                        "summary_en": {"type": "string"},
                        "moves": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "additionalProperties": False,
                                "required": ["asset", "dir"],
                                "properties": {
                                    "asset": {"type": "string", "enum": ASSETS},
                                    "dir": {"type": "string", "enum": DIRS},
                                },
                            },
                        },
                        "sources": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "additionalProperties": False,
                                "required": ["title", "url"],
                                "properties": {"title": {"type": "string"}, "url": {"type": "string"}},
                            },
                        },
                    },
                },
            }
        },
    },
}

PROMPT = """You write the "expert view" section of a forex news calendar for Bangladeshi retail traders.

Below are this week's upcoming high-impact events, grouped (a rate decision with its statement and
press conference, or several prints of the same report, form one group). For each group, search the
web for current previews from analysts, bank economists, polls (Reuters, Bloomberg) and market pricing,
then record:

- keys: exactly the keys listed for that group, copied unchanged.
- event_bn / event_en: a short name for the group, e.g. "FOMC rate decision" / "FOMC সুদের হার সিদ্ধান্ত".
- headline_bn / headline_en: one sentence for a summary table: the consensus and who holds it.
- bias: how experts expect the event's own currency to react in their base case (up, down or mixed when views split or it is priced in).
- summary_bn / summary_en: 2-4 short sentences each. What is expected (consensus and forecast), who
  says so (name the bank, poll or analyst), what would surprise, and how the currency and gold would react.
  Bangla in plain everyday Bangla; keep tickers and numbers in Latin script.
- moves: the expected direction for the event's currency and for gold (XAU) and silver (XAG) when
  experts link the event to metals; add other currencies only when a source names them. Use flat when
  the expected move is small or two-sided.
- sources: 1-4 pages you actually read, with their titles and URLs.

Only state what the sources support; if you find no real preview for a group, say the outlook is
unclear, use bias "mixed" and give the sources you checked. Today is {today}.
When every group is done, call save_outlook once with all entries.

Event groups:
{groups}
"""


def upcoming_groups(today):
    rows = []
    for path in sorted(pathlib.Path("months").glob("*.json")):
        rows += json.loads(path.read_text(encoding="utf-8"))["events"]
    first, last = today - timedelta(days=1), today + timedelta(days=7)
    groups = {}
    for e in rows:
        day = date.fromisoformat(e["date"][:10])
        if e["impact"] != "High" or not first <= day <= last:
            continue
        key = f"{e['date'][:10]}|{e['country']}|{e['title']}"
        figures = f" (forecast {e['forecast'] or '-'}, previous {e['previous'] or '-'})"
        groups.setdefault((e["date"][:10], e["country"]), {})[key] = e["title"] + figures
    return groups


def research(groups, today):
    lines = []
    for (day, country), events in sorted(groups.items()):
        lines.append(f"- {day} {country}:")
        lines += [f"    key {key!r}: {label}" for key, label in events.items()]
    messages = [{"role": "user", "content": PROMPT.format(today=today.isoformat(), groups="\n".join(lines))}]

    client = anthropic.Anthropic()
    for _ in range(6):
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=16000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
            tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 12}, SAVE_TOOL],
            messages=messages,
        )
        if response.stop_reason == "refusal":
            raise SystemExit(f"Request declined: {response.stop_details}")
        saved = next((b for b in response.content if b.type == "tool_use" and b.name == "save_outlook"), None)
        if saved:
            return saved.input["entries"]
        # A long search turn can pause; send it back to let Claude continue.
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "pause_turn":
            messages.append({"role": "user", "content": "Please call save_outlook now with all groups."})
    raise SystemExit("No outlook was saved")


def save(entries, known_keys):
    by_month = {}
    for entry in entries:
        keys = [k for k in entry["keys"] if k in known_keys]
        if not keys:
            continue
        item = {
            "keys": keys,
            "bias": entry["bias"],
            "event": {"bn": entry["event_bn"], "en": entry["event_en"]},
            "headline": {"bn": entry["headline_bn"], "en": entry["headline_en"]},
            "summary": {"bn": entry["summary_bn"], "en": entry["summary_en"]},
            "moves": entry["moves"],
            "sources": [s for s in entry["sources"] if s["url"].startswith("https://")],
        }
        by_month.setdefault(keys[0][:7], []).append(item)

    out = pathlib.Path("outlook")
    out.mkdir(exist_ok=True)
    for month, fresh in by_month.items():
        path = out / f"{month}.json"
        old = json.loads(path.read_text(encoding="utf-8"))["entries"] if path.exists() else []
        replaced = {k for item in fresh for k in item["keys"]}
        kept = [item for item in old if not replaced & set(item["keys"])]
        data = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "entries": kept + fresh}
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{path}: {len(fresh)} new, {len(kept)} kept")


def main():
    today = datetime.now(timezone.utc).date()
    groups = upcoming_groups(today)
    if not groups:
        print("No upcoming high-impact events")
        return
    known = {key for events in groups.values() for key in events}
    save(research(groups, today), known)


if __name__ == "__main__":
    main()
