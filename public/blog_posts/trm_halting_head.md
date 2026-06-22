## TL;DR

- TRM's halting "Q" head is trained only to predict whether a decoded solution exactly matches the labeled path. It doesn't track that. What it most strongly rewards is structural form (a single clean, contiguous start-to-goal route) and it is comparatively indifferent to whether that route is the canonical one, or even the shortest one.
- Measured signal hierarchy on Maze-Hard: path cleanliness (strong, stable across checkpoints) ≫ canonical convention and shortest-optimality (both secondary; shortest-ness is weak and fragile once paths are already clean).
- Why it matters: using Q as a verifier (as Probabilistic TRM does) may sometimes result in a clean-looking path being picked over one that's actually correct. Q is also used for early stopping during training with a threshold, which often doesn't check shortest-ness at all.


Tiny Recursive Model (TRM) is a recent 7M param recursive model that does well on tasks like ARC AGI 1, Maze-Hard, and Sudoku. TRM and its predecessor Hierarchical Reasoning Model (HRM) rely on a halting head, Q, that decides when the model is done. During training, Q gates how much recursive computation each example gets, and follow-up work (Probabilistic TRM) uses Q as a verifier to steer stochastic rollouts. So what Q rewards specifically is worth pinning down: is it the exact label it was trained against, or something else? On Maze-Hard, the model signals less the correct label or even shortest-ness in general, and more the structural form of the output.

## The context

TRM solves tasks like Maze-Hard by repeatedly refining a latent guess: it updates an internal state over many recursive steps and decodes a full grid at the end, rather than emitting it in one pass.

Every Maze-Hard maze has multiple shortest-path solutions, but the labels mark only one correct, chosen by an implicit BFS tiebreak. So interestingly, the model is asked not to learn to find a shortest path, but to learn to find the shortest path that's preferred by the implicit tiebreak in the labels (order: down, left, right, up).

Maze-Hard is Sapient Intelligence's 30×30 maze benchmark, adapted from Lehnert et al.'s Searchformer maze-generation setup by filtering for mazes with shortest-path length >110. It was then used in the HRM and TRM papers as one of 3 main benchmarks alongside Sudoku and ARC AGI 1.

![[shortest-vs-canonical-viz.png]]Fig 1: Three maze examples from Maze-Hard. Canonical label path in green, cells belonging to alternate shortest paths in yellow.

The TRM's Q head produces a scalar logit trained with a binary cross entropy loss to predict whether or not decoding the solution now will exactly match the labeled grid. This signal was used for early stopping in training rollouts, so instead of always rolling out 16 full recursive steps, if at the end of a step the Q head logit was > 0, no more steps would be spent on that training example. 10% of the time, a minimum number of recursive steps was generated between 2 and 16, overriding the Q head.

For clarity, here's the terminology I'll use:

- Canonical -> the labeled path: clean shortest path that follows the BFS tiebreak
- CSNC (clean shortest non-canonical) -> clean shortest path not following the tiebreak
- Clean non-shortest -> a single connected path from start to goal, no branches/spurs, no islands, but longer than optimal
- Branchy -> a single connected path from start to goal, but with branches/spurs
- Disconnected -> 2+ fragments/islands

The specific properties used to define cleanliness

- Connected traversable path from start to end: BFS from start along path reaches end
- Per-cell path degree check: each path component (excluding start/end) must have exactly 2 neighboring path components (including start/end)

The primary model in this post is a reproduction of the paper's Maze-Hard TRM, trained by Yagiz Devre and [posted on HuggingFace](https://huggingface.co/yagizdevre/trm-maze-30x30). I'll call it the original-recipe model, to distinguish it from the schedule-jitter model introduced later.

## Q disregards its training label in favor of cleanliness

The model exactly matches the canonical label on 785/1000 mazes, but produces a clean start-to-goal route on 890/1000: 50 CSNC paths plus 55 clean non-shortest paths.

To get a better sense of how well the model separates classes, we'll use AUC, a metric that can be interpreted as the probability the model will rank a random positive sample over a random negative sample. 

- AUC(Q, canonical) = 0.896
- AUC(Q, clean) = 0.991

Relabeling these clean outputs as positive moves separability indicated by AUC from strong to almost perfect (Δ = +0.095). 

To estimate a confidence interval, I sample 1000 mazes from the test set with replacement, approximating the maze distribution. Repeating this 10k times, I get a 95% confidence interval of [+0.069, +0.122] and P(Δ ≤ 0) = 0/10000, so this +0.095 difference is stable across redraws from this dataset's distribution.

Since the Q logit value per maze is constant, the change in AUC is purely a product of relabeling the clean non-canonical boards (50 CSNC + 55 clean non-shortest) from "wrong" to "right". Q was trained to call these 105 boards wrong, so relabeling them as right should have lowered AUC if Q's scores tracked its trained target. Fig. 2 shows the distribution of Q logit values by class: it's clear the probability masses of clean non-canonical Q values (CSNC and clean non-shortest) overlap more with those of canonical boards than those of the other negative classes (branchy + disconnected). This holds despite all classes aside from canonical holding identical negative training labels.

![[5-class-kde.png]]Fig. 2: KDE showing probability mass of Q logit value by class. Exact data points are below in the rug plot. Q threshold used for early stopping during training is marked with the dashed line. Clean connected paths tend to have a Q logit above 0 while branchy and disconnected paths tend to cluster below 0.

The KDE makes the ordering visible. The three clean classes (canonical, CSNC, clean non-shortest) sit above the halting threshold while branchy and disconnected fall below it. Cleanliness is the dominant axis (the 0.991 relabel above confirms this). Within the clean classes, two weaker axes appear:

- **Convention is weakly present.** Canonical clusters a little higher and tighter than CSNC and clean non-shortest. To isolate the convention axis, we can calculate separation between canonical and CSNC (both shortest paths, differ only in adherence to the BFS tiebreak). Canonical vs CSNC AUC = **0.765** (95% CI [0.687, 0.832]; 0.5 would mean Q ignored the tiebreak entirely).
- **Shortest-ness is weaker still, essentially absent.** Looking at the KDE, CSNC and clean non-shortest land almost on top of each other. These two classes are both clean and non-canonical and therefore let us isolate shortest-ness: CSNC vs clean non-shortest AUC = **0.549** (95% CI [0.436, 0.661], covering chance).

So Q grades structural cleanliness, with a slight convention axis and no real sensitivity to whether the clean path is actually the shortest one.

## Is this just a quirk of this specific training run?

The original-recipe maze TRM updates a low level state four times before updating a high level state. One recursive step runs that four low then one high cycle three times: the $[4,4,4]$ schedule.

In the process of my other TRM experiments, I trained a version of the TRM with schedule jitter: instead of $[4,4,4]$ throughout, some of the time I would vary the schedule, running different numbers of low level steps before a high level step while keeping the total number of low and high level steps the same (ex. $[2, 4, 6]$, $[5,2,5]$, etc.). Given I have 10 checkpoints of this model during training, I tested whether or not this pattern held across all 10 checkpoints.

Fig. 3 shows that AUC(Q, clean) > AUC(Q, canonical) across all checkpoints. 

![[canonical-vs-clean-aucs-all.png]]
Fig. 3: AUC(Q, clean) vs AUC(Q, canonical) across all checkpoints. Δ (AUC_clean − AUC_canonical) is positive on 10/10 schedule-jitter checkpoints, with the bootstrap confidence interval excluding zero on 9/10. Δ ranges +0.011 to +0.137 (median +0.052); only the earliest checkpoint is borderline (Δ +0.011, CI [−0.003, +0.025], p=0.054). The number of clean non-canonical classified boards ranges 79–451 (median 119).

Fig. 4 shows the order of importance of the axes roughly holds across all checkpoints: cleanliness > convention > shortest-ness (at 3 checkpoints there is overlap in the confidence intervals between convention and shortest-ness).

![[q-main-axes.png]]
Fig. 4: AUC(Q, cleanliness), AUC(Q, convention), and AUC(Q, shortest-ness) across all checkpoints, with bootstrap 95% confidence intervals.

On the final schedule-jitter checkpoint the model's accuracy collapses, getting only 356/1000 correct boards but maintaining 807/1000 clean outputs. Even in these conditions, the preference for cleanliness over convention is unchanged as seen in Fig. 4 (390k steps). So even when the output head drifted in behavior, Q stayed largely consistent in its preference. 

So the results hold. Of course these checkpoints are from the same training run, so this is consistency across training plus a second recipe with the same finding, not 10 independent replications.

## What happens when Q is used with a threshold?

Everything so far has been a ranking result via AUC. But during training Q is used as a gate: at `Q>0`, recursion stops for that example. So at training time it's the threshold behavior shaping the computation. Looking at Q's threshold behavior, we see a similar picture. 

The threshold setup gives these adjacent halting probabilities:

$$
P(Q > 0 \mid \text{not clean}) = 0.018
$$

$$
P(Q > 0 \mid \text{clean, non-shortest}) = 0.745
$$

$$
P(Q > 0 \mid \text{clean, shortest, non-canonical}) = 0.780
$$

$$
P(Q > 0 \mid \text{clean, shortest, canonical}) = 0.954
$$

The table below gives each axis's contribution to the probability of halting (Q>0) derived as deltas from the above probabilities:

| Axis         | Effect on Q>0 pass probability | 95% CI         |
| ------------ | ------------------------------ | -------------- |
| Cleanliness  | +0.73                          | [+0.61, +0.84] |
| Shortestness | +0.03 n.s.                     | [-0.13, +0.20] |
| Convention   | +0.17                          | [+0.07, +0.30] |

The threshold halts strongly on cleanliness, near zero on shortest-ness, and weakly on convention. This matches the ranking picture: cleanliness is dominant, convention is secondary, and shortest-ness is near chance. The same ordering shows up in the ranking AUCs (matched single-axis contrasts): 0.966 for clean non-shortest vs islanded/disconnected, 0.765 for canonical vs CSNC, and 0.549 for CSNC vs clean non-shortest. The clean classes clear the threshold; branchy and disconnected mostly fall below it.

![[threshold-behavior.png]]
Fig. 5: Modeled P(Q>0) by nested path profile across schedule-jitter checkpoints (original recipe detached, left). Profiles add one property at a time: not clean → clean non-shortest → CSNC → canonical. Not-clean stays near the floor everywhere and canonical sits above the other clean classes everywhere. Absolute probabilities swing by checkpoint, but the structure remains. 

Fig. 5 traces P(Q>0) by path type across the schedule-jitter run. Three things hold at every checkpoint: not-clean paths almost never halt (cleanliness is close to a precondition for halting); clean-shortest and clean-non-shortest track each other (shortest-ness doesn't move the threshold, and its sign even flips between checkpoints); and canonical halts more than clean-non-canonical (convention is a consistent upward tilt).

What moves is the overall halt rate, changing which axis dominates the threshold cut. When a checkpoint is permissive, most clean paths clear the bar and cleanliness is the separating axis; when it is conservative (e.g. the final checkpoint), the cut rises into the upper tail where canonical separates from the other clean classes, which (per Fig. 2) is exactly where convention does its separating, so convention becomes the locally dominant axis there. Q's underlying structure remains; the structure relative to the threshold shifts. 

Because this gate runs throughout training, it may affect what the prediction head learns by stopping once an output looks clean before it is necessarily canonical. That being said, I ran my analysis with inference time settings (no early stopping from Q), which is how Probabilistic TRM uses Q. The training gate discussion is more speculative: during training, Q halts on intermediate states I haven't directly probed, so the inference time behavior is only a proxy for it. For example, looking at intermediate states it could be the case that Q incorporates how converged the computation is or even the raw number of recursive steps taken so far, both of which likely correlate with cleanliness. So, while I suspect a training effect, it remains an open question requiring further investigation. 

## Conclusion

On Maze-Hard, TRM's halting head grades structural form over correctness. Q's ranking is dominated by path cleanliness strongly and stably across both training recipes. Properties the task depends on like canonical tiebreak and shortest-ness show up as secondary or not at all. This is an existence proof that despite being trained to predict an exact label, Q can learn an unintended heuristic based on task structure.

When Q's raw logit is used as a verifier (e.g. Probabilistic TRM's rollout selection), the emergent structure here is not likely to cause catastrophic issues: a canonical path is still likely to have a larger Q than a clean non-shortest or CSNC path. Yet there is some overlap between the distributions of canonical and clean non-canonical paths, meaning there could be instances where Q chooses a clean correct-looking path over one that's actually labeled correct. 

The behavior of early stop gate that uses Q during training is dependent on where in the distribution the threshold slices. Much of the time we saw it prioritizes cleanliness, sometimes in certain conditions like overall accuracy collapse it prioritizes convention. That Q's learned heuristics affect the prediction head's training is suggested but not established. 

## Citations

- Wang, G., Li, J., Sun, Y., Chen, X., Liu, C., Wu, Y., Lu, M., Song, S., & Abbasi Yadkori, Y. (2025). _Hierarchical Reasoning Model_. arXiv:2506.21734. — introduces the Maze-Hard benchmark.
- Jolicoeur-Martineau, A. (2025). _Less is More: Recursive Reasoning with Tiny Networks_. arXiv:2510.04871. — the TRM paper.
- Lehnert, L., Sukhbaatar, S., et al. (2024). _Beyond A*: Better Planning with Transformers via Search Dynamics Bootstrapping_ (Searchformer). arXiv:2402.14083. — source of the maze-generation setup.
- Sghaier, A., Parviz, A., & Jolicoeur-Martineau, A. (2026). _Probabilistic Tiny Recursive Model_ (PTRM). arXiv:2605.19943.