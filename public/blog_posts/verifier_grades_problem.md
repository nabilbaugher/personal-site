## TL;DR

- TRM's halting "Q" head (trained only to predict whether a solution **exactly matches the labeled answer**) instead ranks solutions by whether they're a **valid shortest path**, a more general property it was never told to track. A second model and training recipe show the same thing.
- Why it matters: anything that reuses Q as a correctness signal inherits this validity bias; most apparent where it acts at Q's threshold (e.g. early-stop gating in training), least where it acts on the top logits (e.g. Probabilistic TRM rollout selection). 


Tiny Recursive Model (TRM) is a recent 7M param recursive model that does well on tasks like ARC AGI 1, Maze-Hard, and Sudoku. TRM and its predecessor Hierarchical Reasoning Model (HRM) rely on a halting head, Q, that decides when the model is done. During training, Q gates how much recursive computation each example gets, and follow-up work (Probabilistic TRM) uses Q as a verifier to steer stochastic rollouts. So what Q rewards specifically is worth pinning down: is it the exact label it was trained against, or something more general? On Maze-Hard, it's the latter. 

## The context

TRM solves tasks like Maze-Hard by repeatedly refining a latent guess: it updates an internal state over many recursive steps and decodes a full grid at the end, rather than emitting it in one pass. 

Every Maze-Hard maze has multiple shortest-path solutions, but the labels mark only one correct, chosen by an implicit BFS tiebreak. So interestingly, the model is asked not to learn to find a shortest path, but to learn to find the shortest path that's preferred by the implicit tiebreak in the labels (order: down, left, right, up). 

Maze-Hard is Sapient Intelligence’s 30×30 maze benchmark, adapted from Lehnert et al.’s Searchformer maze-generation setup by filtering for mazes with shortest-path length >110. It was then used in the HRM and TRM papers as one of 3 main benchmarks alongside Sudoku and ARC AGI 1. 

![[shortest-vs-canonical-viz.png]]
Fig 1: Three maze examples from Maze-Hard. Canonical label path in green, other valid shortest path cells in yellow. 

The TRM's Q head produces a scalar logit trained with a binary cross entropy loss to predict whether or not decoding the solution now will exactly match the labeled grid. This signal was used for early stopping in training rollouts, so instead of always rolling out 16 full recursive steps, if at the end of a step the Q head logit was > 0, no more steps would be spent on that training example. 10% of the time, a minimum number of recursive steps was generated between 2 and 16, overriding the Q head. 

For clarity, here's the terminology I'll use:
- Canonical -> correct label, shortest path
- Valid -> shortest path
- Valid-nc (valid-non-canonical) -> incorrect label, shortest path
- Invalid -> not shortest path (definitionally incorrect label)

The primary model in this post is a reproduction of the paper's Maze-Hard TRM, trained by Yagiz Devre and [posted on HuggingFace](https://huggingface.co/yagizdevre/trm-maze-30x30). I'll call it the **original-recipe model**, to distinguish it from the **schedule-jitter model** introduced later.

## Q ranks validity first; its verdicts don't enforce the convention

The model produces the canonical solution 785/1000 times, but produces a valid shortest path 835/1000 times. So on 50 of the mazes, the model produces a valid shortest path that doesn't follow the canonical tiebreak rule.

Looking at the Q head logits for these 1000 mazes, I find AUC(Q, canonical) = 0.8963 and AUC(Q, valid) = 0.9297, a difference of Δ = +0.0334.

Since the Q logit value per maze is constant, the change in AUC is purely a product of relabeling the valid shortest paths from "wrong" to "right". Q was trained to call these 50 boards wrong, so relabeling them as right should have lowered AUC if Q's scores tracked its trained target. Fig. 2 shows the distribution of Q logit values by class: it's clear the probability masses of canonical and valid-nc overlap more than those of valid-nc and invalid, despite valid-nc and invalid sharing identical training labels. 

![[q-logit-density.png]]
Fig. 2: KDE showing probability mass of Q logit value by class. Exact data points are below in the rug plot.

To estimate a confidence interval, I sample 1000 mazes from the test set with replacement, approximating the maze distribution. Repeating this 10k times, I get a 95% confidence interval of $[+0.014, +0.056]$ and $P(\Delta \le 0)\approx 0.0003$, so this $+0.0334$ difference is stable across redraws from this dataset's distribution. 

One boring explanation is that Q is insensitive to small cell-level diffs. To rule this out, I compare the 50 valid-nc predictions (which have cell-level distances of 8–64) to a matched set of 50 invalid predictions in the same distance range (49/50 boards match cell-level distance exactly). At training time, Q logit values > 0 are used as a signal to stop computation, so I'll call Q > 0 a pass. I find that the valid-nc predictions have a Q logit mean of +1.37 and pass 78% of the time while the 50 distance-matched invalid predictions have a Q logit mean of -1.59 and pass 38% of the time. I additionally checked the invalid predictions with a cell level diff of <10 changes and found a mean Q of -3.15 and pass 10% of the time. So this confound is unlikely. 

To get a clearer picture of the separability of canonical, invalid, and valid-nc, I can look at the pairwise AUCs. 

- Canonical vs invalid AUC = 0.936 -> sanity check: Q separates trained positives from clear negatives.
- Valid-nc vs invalid AUC = 0.826 -> Q does a solid job of separating shortest path non-canonical mazes from invalid mazes despite both categories being labeled wrong during Q's training. If Q were calibrated perfectly on its training objective of exact match, this would be 0.5.
- Canonical vs valid-nc AUC= 0.765 -> Q does a decent job of separating maze solutions based on convention following. This would have been 0.5 if Q ignored convention entirely, clearly it didn't. 

So it seems the Q head encodes a combination of a strong validity axis and a weaker but still present canonicality axis. As Fig. 2 shows, the canonicality separation happens primarily above the decision threshold. So during training, despite canonicality being somewhat encoded in the Q logit, the threshold would generally halt on a shortest path, whether canonical or not.

## Is this just a quirk of this specific training run?

The original-recipe maze TRM updates a low level state four times before updating a high level state. One recursive step runs that four-low-then-one-high cycle three times: the $[4,4,4]$ schedule. 

In the process of my other TRM experiments, I trained a version of the TRM with schedule jitter: instead of $[4,4,4]$ throughout, some of the time I would vary the schedule, running different numbers of low level steps before a high level step while keeping the total number of low and high level steps the same (ex. $[2, 4, 6]$, $[5,2,5]$, etc.). Given I have 10 checkpoints of this model during training, I tested whether or not this pattern held across all 10 checkpoints. 

I found that $\text{AUC}(\text{valid}) > \text{AUC}(\text{canonical})$ on all 10 schedule-jitter checkpoints, with 9/10 clearing the bootstrapped confidence interval checks.

Clearly both axes (canonicality and validity) exist at every checkpoint (every checkpoint has all three AUCs clearly above the baseline 0.5). 

Relative ordering holds across 9/10 checkpoints, with 3/10 conclusive given the bootstrap confidence intervals including the best-powered checkpoint (n=390). The small valid-nc counts at most checkpoints (27–173) simply don't power per-checkpoint ordering tests. 

Of course these checkpoints are from the same training run so this is consistency across training plus a second recipe with the same finding, not 10 independent replications.

![[pairwise-aucs.png]]
Fig. 3: Error bars are stratified bootstrap 95% CIs. Diamonds mark the original-recipe model, shown as a detached comparison rather than part of the schedule-jitter training trajectory. Valid-nc support varies from n=27 to n=390 across schedule-jitter checkpoints; the original-recipe model has n=50. Original-recipe AUCs: canonical/invalid 0.936, valid-nc/invalid 0.826, canonical/valid-nc 0.765.

## A natural decorrelation

The final jitter checkpoint is interesting in that the model produces the canonical solution on $356/1000$ boards but a valid shortest path on $746/1000$: 390 of its 644 non-canonical outputs are valid shortest paths. Late in training, convention compliance collapsed while validity held. So this is the best example we have of decorrelation between the three classes thanks to training instability. 

Taking a closer look at this now well-powered split, I find that $\text{corr}(Q, \text{valid}) = 0.765$ vs $\text{corr}(Q, \text{canonical}) = 0.484$ over the full 1000 boards. For the original-recipe model those two correlations barely differ, because the labels mostly agree (785/835 valid outputs are also canonical). Here they diverge sharply because there are enough valid-nc boards that the two correlations are forced apart, and it becomes clear that this checkpoint's Q sides with validity. 

Q trained alongside these collapsing outputs, so I can't fully rule out a sharp change in Q at this checkpoint matching the sharp change in output label accuracy. But the Q metrics that don't route through the canonical labels (validity AUC: 0.925, within the run's 0.89–0.94 band; and the pairwise-AUC pattern: Fig. 3) match both the other checkpoints and the original-recipe model. This favors the simpler interpretation: Q stayed put while the outputs moved. 

## Conclusion

For the Maze-Hard task, I find Q's ranking tracks validity better than its own training labels. While both validity and canonicality are present in its logit signal, at the threshold used during training, verdicts side with validity. I conclude that on this task Q behaves as a verifier of a semantic notion of correctness implicit in the task construction instead of an exact label predictor.

This is an existence proof that a Q head used for early stopping can come to encode an implicit heuristic (in this case validity) rather than exact label match. 

This bias affects some uses of Q more than others. Probabilistic TRM's rollout selection takes an argmax over raw logits. Given canonical and valid-nc boards are still relatively separable despite both generally lying at the top of the distribution, that use is less affected by this Q behavior. A preliminary check found Q-selection still generally picks canonical solutions when available. 

Threshold-based uses of Q are more exposed. During training, Q will halt on valid-nc boards significantly more than on invalid boards (78% vs 38% pass). I conjecture this could affect the training of the prediction head, but this remains untested.

## Citations

- Wang, G., Li, J., Sun, Y., Chen, X., Liu, C., Wu, Y., Lu, M., Song, S., & Abbasi Yadkori, Y. (2025). *Hierarchical Reasoning Model*. arXiv:2506.21734. — introduces the Maze-Hard benchmark.
- Jolicoeur-Martineau, A. (2025). *Less is More: Recursive Reasoning with Tiny Networks*. arXiv:2510.04871. — the TRM paper.
- Lehnert, L., Sukhbaatar, S., et al. (2024). *Beyond A\*: Better Planning with Transformers via Search Dynamics Bootstrapping* (Searchformer). arXiv:2402.14083. — source of the maze-generation setup.
- Sghaier, A., Parviz, A., & Jolicoeur-Martineau, A. (2026). *Probabilistic Tiny Recursive Model* (PTRM). arXiv:2605.19943.