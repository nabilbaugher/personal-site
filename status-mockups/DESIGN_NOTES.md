# Auto-updating project status — design notes

Open `index.html` in a browser to see three layouts (toggle at top). All three render from one `PROJECTS` array — that array is the whole design question. Below: how it gets updated automatically, the options, and a recommendation.

## The core idea

Separate **data** from **render**. The page reads a single `projects.json`. Whatever keeps that file current is the "auto" part. Your site is already set up for this — `BlogPost.jsx` fetches markdown from `/public` at runtime, so a `/public/projects.json` fetched the same way is a one-component add.

## How the data stays current — three options

**Option 1 — You edit one JSON file (manual, ~2 min/update).**
Not automatic, but the honest baseline. Cheapest possible test of whether anyone (including you) cares that this section exists before building any pipeline.

**Option 2 — A scheduled agent writes the JSON from your repos (recommended).**
A daily/weekly job reads each repo's signals — latest commits, the tail of `experiment_log.md`, README status lines — and regenerates `projects.json`, summarizing the recent activity into one or two lines. This is exactly the "I make progress and it updates without me writing about it" outcome you described. I can set this up as a scheduled task that commits to the site repo.

**Option 3 — Git-hook / CI on push.**
The status regenerates whenever you push to a project repo. Most "real-time," but it only fires when you push, needs CI wiring across three separate repos, and is the most to maintain.

## Recommendation: Option 1 now → Option 2 once it's earning its place

Lean-startup read: the riskiest assumption isn't "can this auto-update" (clearly yes) — it's **"will a public, always-on status of unfinished work be something you actually want visitors to see, and want kept live?"** That's a behavior/taste question, and an LLM-summarized log carries a real failure mode: it can surface half-baked or misleading framings of in-progress work onto your public site without you in the loop.

So validate cheaply: ship one layout with a hand-written `projects.json` (Option 1). If after a couple of weeks you're glad it's there and the manual edit is the annoying part, that's the signal to build Option 2 — and by then you'll know exactly which fields matter, so the generator is easy to spec. Building the pipeline first risks polishing a feature you might not keep.

A guardrail worth keeping in any automated version: agent regenerates a **draft** JSON, you approve before it goes live. Keeps the human-in-the-loop on public framing while removing the writing burden.

## Which layout

- **A · Ledger** — matches your site best; lowest risk; scales worst past ~6 projects.
- **B · Cards** — most momentum visible without a click; good if a visitor won't expand anything.
- **C · Activity stream** — the most natural fit for auto-generation, since each commit/log entry is literally one appended line. Strongest if you go Option 2.

My pick: **A for the static start** (it'll look like it belongs), and revisit **C** if you go automated — the stream and an append-only generator are made for each other.

## What's wired vs. mocked

Real, from your repos: all titles, focuses, metrics, and activity lines. Mocked: nothing fabricated, but I inferred status labels and dates from commit history and log mtimes — check the ARC "110+ hr" figure and the dates against your own memory.

## If you want to proceed

Fastest path to live: I turn this into a `ProjectStatus.jsx` component + `/public/projects.json`, add a route or a section on Home, and you have a working version to push. Say the word and which layout.
