## What this is

The Tiny Recursive Model (TRM) is a recent ~7M-parameter recursive model that does surprisingly well on reasoning tasks like ARC-AGI-1, Maze-Hard, and Sudoku. Instead of emitting an answer in one pass, it repeatedly refines an internal latent guess over many recursive steps, then decodes a full solution at the end. A small **halting head ("Q")** decides when it's done — and, in follow-up work, gets reused as a verifier to steer stochastic rollouts.

That makes Q worth pinning down. It's trained on one narrow target — predict whether decoding *now* would exactly match the labeled answer — but it's used as if it were a general correctness signal. So: does it actually track the exact label, shortest optimality, or something else? This thread is a writeup answering that, plus a related investigation into a larger sibling model.

## Post 1 — What TRM's Halting Head Actually Learns

On Maze-Hard, every maze has multiple possible routes, but the labels mark only one "correct," chosen by an implicit tie-break over shortest paths. So the model is not merely asked to find a route — it is asked to find the route the labeling convention happens to prefer.

The finding: **Q mostly rewards structural cleanliness over the canonical label it was trained on.** The model exactly matches the canonical label on 785/1000 mazes, but produces a clean start-to-goal route on 890/1000. Measured as ranking quality, AUC against *cleanliness* beats AUC against the *canonical label* by Δ ≈ +0.095. Within clean paths, canonical convention is weakly present and shortest-optimality is weaker still.

Why it matters: anything that reuses Q as a correctness signal inherits this cleanliness bias. That is most consequential where Q acts at its threshold, such as early-stop gating during training, and it can also shape verifier-guided rollout selection.

→ Full post: [What TRM's Halting Head Actually Learns](/blog/trm-halting-head)

## Related essay — Saying Things That Are True

An essay on the standard that matters when publishing model behavior claims: saying things that survive contact with the actual evidence.

→ Full post: [Saying Things That Are True](https://substack.com/home/post/p-191404123)

## Related thread — HRM-Text 1B calibration

Alongside the TRM work, a parallel investigation into HRM-Text (a 1B-parameter recurrent-reasoning text model from the same lineage). The bulk of it became a study of **knowing-what-you-don't-know**: getting the model to abstain on questions it can't answer without wrecking the questions it can.

Highlights from that thread:

- **Cycle-depth ablations:** shallower recursion (H2L2) matched deeper (H2L3) on templated probes at lower latency; the shallowest variants collapsed on compositional arithmetic.
- **Abstention is a separate gate, not a fine-tune.** Training the model to directly say "UNKNOWN" either over-abstained or damaged known answers. A **frozen-state linear probe** over the final hidden state cleanly separated answerable from unanswerable on synthetic splits.
- **The hard case is fictional-but-plausible entities.** Real-vs-fictional city/country near-neighbors broke early gates; targeted augmentation helped but exposed that threshold selection and real-entity over-abstention are the real bottlenecks.
- The honest takeaway: post-hoc tuning over small suites produced flattering numbers that didn't survive a fresh blind set — the next useful step is a larger pre-declared calibration corpus, not more tuning.

## Status

One TRM post drafted and shaped; the halting-head finding is the headline. The HRM-Text calibration thread is research-stage with a clear next experiment (a contamination-aware, pre-declared benchmark) rather than a writeup yet.
