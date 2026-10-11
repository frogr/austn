# Conversion playbook

What the site is for: a hiring manager or a founder lands on it, reads
enough to trust the work, and books a call. Everything else is in service
of that. This file says what we watch, what counts as a problem, and what
we do about each one. The digest email (`VisitDigest`, Monday and Thursday)
names these rules by their key when they fire.

Nothing here costs money. The analytics are our own tables, the digest is
one email, and every move is a change to the site.

## The funnel

1. Arrive (a visit that is not a crawler or a swarm)
2. Read (more than one page)
3. See the offer (`/hire`)
4. Take a step (open a demo, open a case study from the offer, open `/book`)
5. Book

The admin page at `/admin/analytics` shows these as the hire funnel. The
digest shows the last three days against the three before.

## What good looks like

These are starting targets for a personal site with outreach going on,
not industry numbers. Revise them after a month of data.

| Step | Target | Below that, look at |
|---|---|---|
| Readers / visitors | 40% or more | the landing page (`referred-bounce`, `phone-bounce`) |
| Hire page / readers | 30% or more | links to `/hire` from the pages people read (`resume-not-hire`, `work-not-hire`) |
| Took a step / hire visitors | 40% or more | the hire page itself (`hire-no-action`) |
| Booked / opened `/book` | 20% or more | the calendar and the form (`book-no-booking`, `few-slots`) |

## The rules and the moves

Each key matches a signal in the digest. The count is people, over three
days. A rule that fires once is noise; one that fires three digests in a
row is a job.

### `hire-no-action`

People saw the hire page and left without opening a demo, a case study or
the booking page.

Moves, in order:

1. Put a "Book a call" button inside each offer card, not just in the rail
   and at the bottom. On a phone the rail comes after the cards.
2. Cut the lede to two sentences and lead with the outcome, not the method.
3. Make the first thing under each offer the "See it working" list, with
   the "Try it live" buttons, and move "You get" below it. People believe
   a demo before a bullet list.
4. Add one line of social proof per offer when there is a real one to add
   (a client sentence, a number from the case study). Never invent one.

### `book-no-booking`

People opened the booking page and did not book.

1. Check `/admin/availabilities`. Are there open slots in the next two
   weeks, at hours that work for a US business day? `few-slots` fires below
   five, but five slots all at 4pm Friday is also a problem.
2. Check the form on a phone. It asks for name, email, phone and notes.
   Phone is required; consider making it optional.
3. Say on the booking page what the call is: thirty minutes, no prep, what
   they'll leave with. People book calls they understand.
4. Offer email as the alternative right on the page. Some people won't book
   a stranger's calendar but will write.

### `resume-not-hire`

People read the resume but never saw the hire page.

1. The resume page rail says "Looking for" with a link to book. Add one
   sentence about the hire page there, with the link, above the fold.
2. If these visitors are mostly recruiters (US cities, business hours,
   direct), that is fine: they want the resume. Watch the `ref` tags from
   outreach to tell applications from hire prospects.

### `work-not-hire`

People read a case study but never saw the hire page.

1. Every case study that is a sample for an offer already ends with a
   hire note. Add a shorter version to the rest: one line, "I build these
   for clients", link to `/hire`.
2. Check which case studies they read. If it's the job write-ups (Tenex,
   Backlit, CompanyCam), these are likely recruiters, and that is fine.

### `referred-bounce`

People arrived from a link, a referrer or a tag and left after one page.

1. Compare what the link promised with the first screen. A tweet about
   MCP servers should land on `/hire#mcp-server`, not on the home page.
2. Tag every link we hand out with `?ref=` so we know which promise failed.
3. The home page has to fit one screen and send people somewhere. If it
   fires with the home page as landing, look at the first three links on
   it and whether they match what people searched or clicked for.

### `phone-bounce`

Phones leave after one page far more often than computers.

1. Open the landing pages at 390px. Check the first screen: is the name,
   the one-line pitch and one button visible without scrolling?
2. Check tap targets and the palette picker on a phone.
3. Check load time on a slow connection. The font is self-hosted and the
   pages have no script, so this should be fine; verify.

### `few-slots`

Fewer than five open booking slots in the next fourteen days.

1. Add weekly hours in `/admin/availability_rules` or one-off times in
   `/admin/availabilities`. Do this before the next outreach batch.

## Outreach

- Every link we send carries `?ref=<company>` (or `?ref=<batch>` if that
  is easier). The digest lists the tags that brought people.
- A tagged visit that read the resume and the hire page is warm. Follow up
  within two days with something specific to what they read.
- A tagged visit that bounced is a bad landing page for that promise, not
  a lost cause. Fix the page, send one more note with the right link.

## What we do not do

- No pop-ups, no chat widget, no exit-intent boxes, no tracking script.
  The site's quietness is part of the pitch.
- No numbers we don't have. If a claim needs a number, we get the number or
  drop the claim.
- No paid traffic until the free funnel converts. Paying to send people to
  a page that loses them is paying twice.

## Review cadence

- Read the digest when it arrives. If a rule fires, note it.
- Every two weeks, read `/admin/analytics` over 30 days and compare the
  funnel to the targets above. Pick one move. Ship it. Watch two digests.
- Change one thing at a time, so the next digest can tell you if it worked.
