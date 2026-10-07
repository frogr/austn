#!/usr/bin/env bash
# Deploys main to the droplet the way Hatchbox did: a new release under
# ~/austn/releases, shared dirs linked in, assets built, migrations run, the
# `current` symlink flipped, then the systemd user units restarted.
#
# Run it on the droplet as the deploy user:
#   ssh austn-vps 'bash -s' < script/deploy_droplet.sh
#
# Rollback: point ~/austn/current at the previous release and restart the
# two units (the last two lines of this script).
set -euo pipefail

export PATH="$HOME/.asdf/shims:$HOME/.asdf/bin:$PATH"
set -a; source "$HOME/austn/.asdf-vars"; set +a
export RAILS_ENV=production

APP="$HOME/austn"
RUBY_VERSION="$(curl -fsSL https://raw.githubusercontent.com/frogr/austn/main/.ruby-version)"
RELEASE="$APP/releases/$(date +%Y%m%d%H%M%S)"

echo "== Ruby $RUBY_VERSION"
if ! asdf list ruby 2>/dev/null | grep -q "$RUBY_VERSION"; then
  # One core and 1 GB of RAM: build serially, skip docs. Takes a while.
  MAKE_OPTS=-j1 RUBY_CONFIGURE_OPTS=--disable-install-doc asdf install ruby "$RUBY_VERSION"
fi

echo "== Fetch main"
cd "$APP/repo"   # a bare mirror, so branches are plain refs
git fetch -q origin main:main
SHA="$(git rev-parse main)"

echo "== Release $RELEASE ($SHA)"
mkdir -p "$RELEASE"
git archive "$SHA" | tar -x -C "$RELEASE"
echo "$SHA" > "$RELEASE/REVISION"
cd "$RELEASE"
echo "ruby $RUBY_VERSION" > .tool-versions
echo "nodejs $(asdf current nodejs 2>/dev/null | awk '{print $2}')" >> .tool-versions

echo "== Shared dirs"
for dir in log tmp storage node_modules public/assets; do
  rm -rf "$RELEASE/$dir"
  mkdir -p "$APP/shared/$dir" "$(dirname "$RELEASE/$dir")"
  ln -s "$APP/shared/$dir" "$RELEASE/$dir"
done

echo "== Gems"
gem install bundler --conservative --no-document
bundle config set --local deployment true
bundle config set --local path "$APP/shared/bundle"
bundle config set --local without "development:test"
bundle install --jobs 1

echo "== JavaScript and assets"
yarn install --frozen-lockfile
bin/rails assets:precompile

echo "== Database backup, then migrate"
pg_dump --no-owner --format=custom "$DATABASE_URL" > "$APP/shared/backup-before-$(basename "$RELEASE").dump"
bin/rails db:migrate

echo "== Switch and restart"
ln -sfn "$RELEASE" "$APP/current"
systemctl --user restart austn-server austn-sidekiq

echo "== After deploy"
cd "$APP/current"
bin/rails runner 'AvailabilityRule.create_defaults!; AvailabilityRule.where(weekday: 1..5).update_all(start_time: "11:00", end_time: "17:00", active: true); puts AvailabilityRule.active.count.to_s + " rules"'
bin/rails runner 'PostDeployJob.perform_now'

sleep 5
curl -fsS -o /dev/null -w "austn.net /up -> %{http_code}\n" https://austn.net/up
echo "Deployed $SHA. Previous release: $(ls -1 "$APP/releases" | tail -2 | head -1)"
