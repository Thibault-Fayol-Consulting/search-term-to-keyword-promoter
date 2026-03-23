# Search Term to Keyword Promoter

Finds high-converting search terms and automatically adds them as exact match keywords to their originating ad groups. Captures proven demand that would otherwise stay buried in search term reports.

## What it does

1. Queries `search_term_view` via GAQL for terms meeting the conversion threshold
2. Deduplicates results by search term + ad group
3. Adds each qualifying term as an exact match keyword to its originating ad group
4. Sends an email report of all promoted terms with performance data

## Setup

1. Copy `main_en.gs` (or `main_fr.gs`) into a new Google Ads Script
2. Update `CONFIG.EMAIL` and `CONFIG.MIN_CONVERSIONS`
3. Run in TEST_MODE to review candidates
4. Set `TEST_MODE: false` when ready
5. Schedule weekly

## CONFIG reference

| Parameter | Default | Description |
|---|---|---|
| `TEST_MODE` | `true` | Log only — no keywords added |
| `EMAIL` | `you@example.com` | Email recipient |
| `MIN_CONVERSIONS` | `3` | Minimum conversions to promote a term |
| `DATE_RANGE` | `LAST_30_DAYS` | Analysis window |

## How it works

Uses `AdsApp.search()` with GAQL on `search_term_view` filtered by `metrics.conversions >= MIN_CONVERSIONS`. For each qualifying term, it adds `[term]` as an exact match keyword using `newKeywordBuilder()`. Deduplication prevents adding the same term twice in the same ad group.

## Requirements

- Google Ads account with active Search campaigns
- Permission to send emails (MailApp)

## License

MIT — Thibault Fayol Consulting
