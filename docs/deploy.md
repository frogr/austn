# Deploying austn.net

The site runs on one DigitalOcean droplet (138.197.193.186, `austn-vps` in
`~/.ssh/config`) that Hatchbox set up: Caddy in front of Puma on port 9000,
Sidekiq, Postgres 17 and Redis on the box, Ruby and Node through asdf,
releases under `~/austn/releases` with `~/austn/current` pointing at the
live one, and the environment in `~/austn/.asdf-vars`. Hatchbox is gone, so
`script/deploy_droplet.sh` does what it did.

## Deploy

```sh
ssh austn-vps 'bash -s' < script/deploy_droplet.sh
```

It fetches `main`, makes a new release, installs gems and node modules,
builds the assets, dumps the database to `~/austn/shared/`, migrates, flips
`current`, restarts the two systemd user units (`austn-server`,
`austn-sidekiq`), makes sure the booking rules exist and imports the blog
posts. A new Ruby version in `.ruby-version` is built first, which takes
about fifteen minutes on the one core.

To roll back, point `current` at the previous release and restart:

```sh
ssh austn-vps 'ln -sfn ~/austn/releases/PREVIOUS ~/austn/current && systemctl --user restart austn-server austn-sidekiq'
```

Useful on the box: `journalctl --user -u austn-server -f`,
`cd ~/austn/current && bin/rails console` (after `set -a; . ~/austn/.asdf-vars; set +a`).

The droplet has 1 GB of RAM and 2 GB of swap. Puma and Sidekiq use most of
it; the 2 GB size is worth the extra $6.

## If the droplet ever has to be rebuilt

The rest of this document is the plan for a fresh box with Kamal, using the
Dockerfile. It has not been run yet.

## What the app needs

- Ruby 3.3.6 and Node 22 (both in the Dockerfile).
- Postgres and Redis.
- Two processes: `bin/thrust bin/rails server` and
  `bundle exec sidekiq -C config/sidekiq.yml`.
- A persistent `storage/` directory for Active Storage (uploads for the GPU
  tools and TTS audio).
- DNS: an A record for `austn.net` and `www.austn.net`.

Environment variables (see the README for what each one does):

| Variable | Value |
| --- | --- |
| `RAILS_MASTER_KEY` | `config/master.key` |
| `DATABASE_HOST`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME` | the Postgres accessory below |
| `REDIS_URL` | `redis://austn-redis:6379/0` |
| `ADMIN_USER_NAME`, `ADMIN_PASSWORD` | admin login |
| `ADMIN_EMAIL` | `austindanielfrench@gmail.com` (this is also the default in code) |
| `MAILER_FROM` | `hi@austn.net`. Resend has to have the austn.net domain verified for this to send. |
| `RESEND_API_KEY` | from resend.com |
| `ANTHROPIC_API_KEY`, `CLAUDE_CORNER_MODEL` | Claude Corner drafts |
| `TTS_API_KEY` | the TTS and image JSON APIs |
| `COMFYUI_URL`, `TTS_URL`, `LMSTUDIO_URL` | leave unset; the GPU box is offline |

## 0. Get the data off the old server first

If the old Hatchbox droplet still exists, take a dump before anything else.
Blog posts and case studies come back from `content/` on the first deploy,
but bookings, clients, invoices, Claude Corner entries and TTS batches live
only in the database.

```sh
ssh deploy@OLD_DROPLET_IP
pg_dump -Fc -U austn austn_production > ~/austn_production.dump
# back home:
scp deploy@OLD_DROPLET_IP:~/austn_production.dump .
```

Also copy the old `storage/` directory if anything in it matters.

## 1. The droplet

In DigitalOcean: Create > Droplets. Ubuntu 24.04, Basic, Regular, 2 GB / 1
vCPU ($12). Add your SSH key. Call it `austn`.

Point DNS at it: in the domain's records, set the A record for `@` and `www`
to the droplet's IP. Do this early so Let's Encrypt can issue the certificate
during the first deploy.

Nothing else needs installing on the droplet. Kamal installs Docker.

## 2. A container registry

Kamal pushes the image to a registry and the droplet pulls it. GitHub's is
free for this: make a personal access token (classic) with `write:packages`
and `read:packages` at github.com/settings/tokens. The image lives at
`ghcr.io/frogr/austn`.

## 3. Kamal config

Add Kamal to the Gemfile's development group and install it:

```ruby
gem "kamal", require: false
```

Then create `config/deploy.yml` (replace `DROPLET_IP`):

```yaml
service: austn
image: frogr/austn

servers:
  web:
    - DROPLET_IP
  job:
    hosts:
      - DROPLET_IP
    cmd: bundle exec sidekiq -C config/sidekiq.yml

proxy:
  ssl: true
  host: austn.net
  healthcheck:
    path: /up

registry:
  server: ghcr.io
  username: frogr
  password:
    - KAMAL_REGISTRY_PASSWORD

builder:
  arch: amd64

env:
  clear:
    DATABASE_HOST: austn-db
    DATABASE_USERNAME: austn
    DATABASE_NAME: austn_production
    REDIS_URL: redis://austn-redis:6379/0
    ADMIN_EMAIL: austindanielfrench@gmail.com
    MAILER_FROM: hi@austn.net
    RAILS_MAX_THREADS: 3
    WEB_CONCURRENCY: 1
  secret:
    - RAILS_MASTER_KEY
    - DATABASE_PASSWORD
    - ADMIN_USER_NAME
    - ADMIN_PASSWORD
    - RESEND_API_KEY
    - ANTHROPIC_API_KEY
    - TTS_API_KEY

volumes:
  - "austn_storage:/rails/storage"

accessories:
  db:
    image: postgres:16
    host: DROPLET_IP
    env:
      clear:
        POSTGRES_USER: austn
        POSTGRES_DB: austn_production
      secret:
        - POSTGRES_PASSWORD
    directories:
      - data:/var/lib/postgresql/data
  redis:
    image: redis:7
    host: DROPLET_IP
    cmd: redis-server --appendonly yes
    directories:
      - data:/data
```

And `.kamal/secrets` (it is read by Kamal on your machine, never copied to
the server as a file; add it to `.gitignore`):

```sh
KAMAL_REGISTRY_PASSWORD=$KAMAL_REGISTRY_PASSWORD
RAILS_MASTER_KEY=$(cat config/master.key)
DATABASE_PASSWORD=$DATABASE_PASSWORD
POSTGRES_PASSWORD=$DATABASE_PASSWORD
ADMIN_USER_NAME=$ADMIN_USER_NAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
RESEND_API_KEY=$RESEND_API_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
TTS_API_KEY=$TTS_API_KEY
```

Export those in your shell before deploying (or keep them in a `.env`
that is already gitignored and `source` it). Make up a long
`DATABASE_PASSWORD`; it only ever travels between the two containers.

## 4. First deploy

From a clean checkout of `main`, with Docker Desktop running:

```sh
bundle install
kamal setup
```

`kamal setup` installs Docker on the droplet, starts Postgres and Redis,
builds the image, pushes it, boots the app, runs `db:prepare` (the Docker
entrypoint does that) and gets a certificate. Ten minutes or so the first
time.

Then, once:

```sh
# Restore the old database, if there is a dump.
kamal accessory exec db --interactive --reuse \
  "pg_restore --clean --if-exists -U austn -d austn_production" < austn_production.dump
kamal app exec "bin/rails db:migrate"

# Fresh database instead: bookable hours and the blog posts.
kamal app exec "bin/rails runner 'AvailabilityRule.create_defaults!'"
kamal app exec "bin/rails runner 'PostDeployJob.perform_now'"
```

If you restored the dump, the old rules say 10 to 5. Move them to 11:

```sh
kamal app exec "bin/rails runner 'AvailabilityRule.where(weekday: 1..5).update_all(start_time: \"11:00\", end_time: \"17:00\", active: true)'"
```

## 5. Every deploy after that

```sh
kamal deploy
kamal app exec "bin/rails runner 'PostDeployJob.perform_now'"
```

Hatchbox ran `PostDeployJob` (the blog importer) by itself after each
deploy. Kamal has no post-deploy hook of its own, so either run the second
line by hand or put it in `.kamal/hooks/post-deploy` (Kamal creates sample
hooks with `kamal init`).

Useful: `kamal app logs -f`, `kamal app exec --interactive "bin/rails console"`,
`kamal accessory logs db`, `kamal rollback <version>`.

## 6. Check it

- https://austn.net/up answers 200 and the certificate is valid.
- Book a slot at /book: the visitor gets the confirmation and
  austindanielfrench@gmail.com gets the notification. If neither arrives,
  check the Resend dashboard: the domain must be verified for
  `hi@austn.net` to send.
- /admin logs in with `ADMIN_USER_NAME` and `ADMIN_PASSWORD`.
- /blog lists the posts (if not, run `PostDeployJob` again).
- /resume.pdf downloads.
- The GPU tools say they are offline rather than erroring.

## Alternative: App Platform

Create > Apps > the GitHub repo, branch `main`. Add: a web service (Ruby
buildpack picks up `.ruby-version`, the Node buildpack picks up
`package.json`, and the build runs `assets:precompile`; run command
`bin/rails server`), a worker (`bundle exec sidekiq -C config/sidekiq.yml`),
a managed Postgres and a managed Redis (set `DATABASE_URL` and `REDIS_URL`
from them). Add a pre-deploy job with `bin/rails db:migrate` and a
post-deploy job with `bin/rails runner 'PostDeployJob.perform_now'`. The
same environment variables as above, marked as secrets. Uploads would need
S3-compatible storage (Spaces) and a `production` entry in
`config/storage.yml`; the `aws-sdk-s3` gem is already in the bundle.
