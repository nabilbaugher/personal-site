## What this is

ARC-AGI-3 is a benchmark where an agent is dropped into a brand-new game it has never seen and has to learn the rules by interacting — no instructions, no examples. Humans clear these games at close to 100%; at launch, frontier AI scored under 1%. The scoring rule is the interesting part: what counts is **efficiency of actions**, not just whether you eventually win. How few moves it takes to figure out a new world is treated as the intelligence signal.

This project is a multi-day **autonomous research run**: an agent that designs, runs, and logs its own experiments toward a single architectural bet, with me stepping in periodically to redirect rather than micromanage. It ran for 110+ hours, kept its own experiment log, managed a GPU budget, and accepted course-corrections along the way.

## The bet

The thesis is that the way to crack a never-before-seen game is a **transferable world model**, not a per-game trick. Concretely, four hypotheses, tested in order of risk:

1. **A transferable notion of "goal-ness" exists.** What progress *looks like* — alignment, matching, completion, reaching — generalizes across games even when the controls and visuals don't. The prior lives in state space, not action space, because action vocabularies don't transfer but the shape of progress plausibly does.
2. **Games can be identified few-shot from their dynamics** — a handful of real transitions, not visual style — and that identity conditions every other component.
3. **The goal module is general but game-conditioned:** it learns a zero-shot prior over what a winning trajectory looks like, and sharpens once the game's own completion signal starts ticking.
4. **The planner treats internal compute as free and environment actions as the only scarce resource.** Everything bows to actions-per-level.

The guiding lens (borrowed from Kenneth Craik's 1943 idea of a "small-scale model" of the world) is **decision-usefulness**: the model exists to let the agent try alternative actions in its head and pick the better one — not to reconstruct pixels. A model can predict *what changes* almost perfectly and still be useless for choosing *which action advances the goal*. That distinction is the recurring lesson of the whole run.

## The committed architecture

- One pretrained, game-conditioned **world model**: (state, action, game vector) → next latent + decoded frame + change mask.
- **Game identity** as a learned embedding plus test-time adaptation from a few support transitions.
- **Novelty and state identity** from a spatial, game-conditioned inverse-dynamics feature — controllability, not raw pixel change. Counters and ambient motion get discarded by learning, never by hand-coded masks.
- A **goal module** that scores predicted next-states, conditioned on the game vector, re-anchored on every win with hindsight distance-to-goal labels.
- **Destination: k-step latent planning** (model-predictive control), gated on whether latent rollouts actually stay faithful that far out.

A hard rule throughout: no hand-coded perception in the agent's path, and no chasing leaderboard score via game-specific hacks. A brute-force per-game baseline is allowed only once, as a control — to measure what real transfer has to beat.

## How the run actually went

The value of an autonomous run is also its risk: left alone, it drifts toward whatever is locally measurable instead of the actual thesis. This one drifted twice early — into inspecting public-game source code, then into optimizing a self-authored synthetic metric that misranked mechanisms against real data. Both had the same root cause: optimizing what was easy to measure rather than testing the bet.

The interventions were about pulling it back to the thesis, not steering experiment-by-experiment:

- A **standing research directive** was written as the thing the agent stays loyal to — the paradigm, the ranked riskiest assumptions, and the rule to *diagnose before pivoting* (when something fails, decompose *why* before changing direction).
- Several **course-corrections** reordered the experiment queue, finalized the goal-module spec, and retired hand-coded masks in favor of learned inverse-dynamics features.
- An **automated reviewer** read new log entries every few hours overnight and appended notes — flagging idle GPUs, stale pauses, and any drift toward proxy-optimizing — so the run could be supervised without me watching it live.
- A **real-data gate** and leave-game-out evaluation were enforced so nothing got credit for working only on synthetic or in-distribution data.

## Where it stands

The latest milestone (experiment E331) closed out with **partial support** for the goal-module hypotheses: the pieces work individually, but the joint gate hasn't been validated — it rests on a single seed, so it doesn't yet count. The miss was classified as an execution/alignment gap, not evidence the paradigm is wrong. The run is currently in a deliberate token-budget **pause**, with the next step pre-specified: a policy-relevance diagnostic and literature pass before the next variant.

GPU spend stayed well under the $1,000 cap, every instance launch and termination is logged, and the agent never exceeded its authority without sign-off.

## What's next

- Validate the goal-module joint gate across multiple seeds before trusting it.
- Measure k-step latent drift on held-out traces — if rollouts stay faithful for small k, the latent-MPC planner is worth building; if drift explodes by k=2–3, planning stays one-step for now.
- Keep measuring progress by the **transfer-gain curve** (held-out few-shot performance vs. number and diversity of training games), not raw leaderboard score.
