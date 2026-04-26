# NYC events aggregator (`/nyc`)

Map + list view of NYC events near you. Mounted at `/nyc`.

## Quick start

```bash
bin/rails db:migrate
bin/rails db:seed   # creates a few demo venues/events so the page isn't empty
bin/dev
open http://localhost:3000/nyc
```

## Required env vars (production)

| Var | What for | Status |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude Haiku 4.5 extracts events from scraped pages. Without it, scrapers run but extract nothing. | Required for live data |
| `MAPTILER_KEY` | Nicer dark map style. Falls back to OSM raster tiles if missing. | Optional |
| `TICKETMASTER_API_KEY` | Pulls ticketed concerts/sports via Ticketmaster Discovery API. Adapter is a no-op without it. | Optional but high signal |

Add via your Kamal secret manager and reference under `env.secret:` in `config/deploy.yml`.

## Manually triggering scrapers

```ruby
Nyc::ScrapeJob.perform_later("skint")
Nyc::ScrapeJob.perform_later("donyc")
Nyc::ScrapeJob.perform_later("time_out")
Nyc::ScrapeJob.perform_later("ticketmaster")
```

Or hit the Sidekiq UI at `/sidekiq` and use "Scheduled" → run now.

## Scraper schedule

Configured in `config/sidekiq.yml`:

- `skint`: daily 6:05am ET
- `donyc`: every 3h
- `time_out`: weekly Mondays 6:25am ET
- `ticketmaster`: every 2h (no-op until key set)

## Cost guardrails

Claude Haiku 4.5 extraction across all scrapers runs ~$2/month at default cadence. To bring costs down, raise the cron intervals or remove DoNYC/Time Out from `config/sidekiq.yml`.

## Adding a new source

1. Create `app/services/nyc/scrapers/your_source.rb` extending `Nyc::ScraperBase`.
2. Implement `#source_name` and `#fetch_extracted` (returning event hashes matching `Nyc::EventExtractor`'s schema).
3. Register in `Nyc::ScrapeJob::SCRAPERS`.
4. Add a `nyc_scrape_your_source` entry in `config/sidekiq.yml`.
