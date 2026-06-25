The recent Hierarchical Reasoning Model (HRM) paper brought a lot of buzz with its release. Its neuro-inspired recursive/hierarchical design and 27M parameter count drew attention given its strong [32% on the ARC-AGI 1 semi-private benchmark](https://arcprize.org/blog/hrm-analysis). The Tiny Recursive Model (TRM) paper quickly followed, stripping it down to a simpler, single module recursive setup and [scoring 40% on the same benchmark](https://x.com/arcprize/status/1978872651180577060) with only 7M params. The paradigm is compelling. Use a recursive model to iteratively update its understanding in the latent space, then decode after allowing iterative latent thought.

My initial hypothesis was that by giving the model the opportunity to attend to previous states, it may learn to backtrack (restore a previous state if the direction to get to the current state seemed incorrect) or find some other useful function for the attention. The approach was loosely inspired by the recent Kimi Attention Residuals paper which introduced attention over residual states in language modeling.

After the attention idea failed causal tests, I mapped what TRM's recursion actually does on Maze-Hard and how it carries information in its hidden states in general. The verifier head findings became a [separate post](https://www.nabilbaugher.com/blog/trm-halting-head).

## What is a Tiny Recursive Model?

The idea behind the TRM is that a small, recursively applied model can iteratively improve its prediction, outperforming a larger single-pass model. The core model is a pretty typical 2-layer transformer (or MLP for Sudoku).

![[trm-block.png|303]] Fig. 1: The core model underlying the TRM.

Two separate hidden states are tracked through recursive steps: one low level representation that's updated frequently and one high level representation that's updated at lower frequency. The paper uses $y$ as high level state and $z$ as low level state but for lack of ambiguity with the common use of $y$ for output, I'll stick with the HRM paper's notation of $z_H$ as high level state and $z_L$ as low level state.

Symbols

- $x$ - input embedding (e.g. maze representation)
- $y$ - target output
- $z_H$ - current high level state
- $z_L$ - current low level state
- $z_{H,\text{init}}$ - learned initial high level state
- $z_{L,\text{init}}$ - learned initial low level state
- $n$ - # times to run low level update before high level update
- $T$ - # times to run high level update in an ACT (Adaptive Computation Time) step
- $A$ - # ACT steps

![[trm.png]] Fig. 2: The recursive structure of TRM. $x + z_H + z_L$ indicates element-wise addition.

Figure 2 shows the process a TRM takes during inference. The low level state is updated $n$ times for each high level update, the high level state is updated $T$ times for each ACT step, and 16 ACT steps are run at inference time. In this analysis I'll focus on the maze task. The paper's settings for maze are $n=4$, $T=3$, and $A=16$. So to predict a given maze's path at inference time, we run $(4+1)*3*16=240$ model inference steps.

At training time, to avoid full backpropagation through time which would be too computationally expensive with this many steps, TRM detaches gradient until the last $T$-step in each ACT. ACT steps are run sequentially, calculating loss and updating model between steps. A supervised Q-head is used during training to detect whether or not the maze is solved and no further ACTs need to be run to save useless training time. Note: the Q-head is not used for early stopping at test time. Learn more about Q in my [other post](https://www.nabilbaugher.com/blog/trm-halting-head).

```
Given input x, target y, initial high-level state z_H_0, and low-level state z_L_0:

For each ACT step a = 1..A:

  # First T-1 high-level cycles are run without gradient.
  for t = 1..T-1:
      repeat n times:
          z_L <- stopgrad(f_theta(z_L + z_H + x))
      z_H <- stopgrad(f_theta(z_H + z_L))

  # Final high-level cycle is trained.
  repeat n times:
      z_L <- f_theta(z_L + z_H + x)
  z_H <- f_theta(z_H + z_L)

  # Decode current answer and train halting.
  y_hat <- g_theta(z_H)
  q     <- q_theta(z_H[0])

  L <- CE(y_hat, y) + 0.5 * BCE(q, 1[y_hat = y])

  update theta using grad(L)

  # Carry state to next ACT step, but truncate gradient.
  z_H <- stopgrad(z_H)
  z_L <- stopgrad(z_L)

  halt if sigmoid(q) > 0.5 or a = A
```

Fig. 3: TRM training loop pseudocode.

## Implementing attention over previous states

My initial hypothesis was that TRM might benefit from a small amount of memory over its own high-level states. In stock TRM, each H-cycle overwrites the previous high-level state $z_H$. That means if an earlier H-cycle found a useful partial structure, the model has to preserve it inside the current state or lose it. I wondered whether letting the model explicitly look back at previous $z_H$ states would help. One possible idea I had in mind was backtracking. Maybe the model would learn how to discard a poor current trajectory in favor of returning to a previous high level state.

I tested a few variants. In all of them, I bounded the history to within a single ACT step. For Maze-Hard, one ACT step has three H-cycles, so the history available at H-cycle $t$ is only $\{z_H^1, \ldots, z_H^{t-1}\}$. It does not attend over previous ACT steps. Previous ACT steps still enter only through TRM's normal detached carry.

Let $b_t$ be the ordinary TRM high-level update at H-cycle $t$, after the low-level state has already been updated $n$ times:

$$ b*t = f*\theta(z_H^{t-1} + z_L^t) $$

The variants differ in how they modify this base update.

1. **Full H-cycle Backprop Through Time (BPTT) control**

   Stock TRM runs the early H-cycles under `no_grad` and only backprops through the final H-cycle. Before testing attention, I needed a control that simply removed this truncation.

2. **Baseline linear history mix**

   This baseline simply added a learned parameter $\alpha$ multiplied by the mean of previous H states in the act to the current state.

3. **Fixed-query attention over previous states**

   The fixed-query version gives each H-cycle a learned query vector. For H-cycle $t$:

   $$ q_t = \text{learned query vector for cycle } t $$

   Previous high-level states become keys and values:

   $$ k_j = \text{RMSNorm}(z_H^j), \quad v_j = z_H^j $$

   Attention weights are:

   $$ w\_{t,j} = \text{softmax}\_j \left( \frac{q_t \cdot k_j}{\sqrt{d}} \right) $$

   and the memory is:

   $$ \text{mem}_t = \sum_{j < t} w\_{t,j} v_j $$

   Then:

   $$ z_H^t = \text{RMSNorm}(b_t + \alpha_t \cdot \text{mem}\_t) $$

   Here the query depends only on the H-cycle index, not on the current example. So this is closer to learning a general schedule like "at H3, look back at H1 vs H2." It is content-aware because the keys come from actual previous states, but the query itself is fixed.

4. **Current-query attention over previous states**

   The more expressive version generates the query from the current base update:

   $$ q_t = W_q b_t $$

   The keys and values are still previous high-level states:

   $$ k_j = \text{RMSNorm}(z_H^j), \quad v_j = z_H^j $$

   Then:

   $$ w\_{t,j} = \text{softmax}\_j \left( \frac{q_t \cdot k_j}{\sqrt{d}} \right) $$

   $$ \text{mem}_t = \sum_{j < t} w\_{t,j} v_j $$

   $$ z_H^t = \text{RMSNorm}(b_t + \alpha_t \cdot \text{mem}\_t) $$

   This is the more natural backtracking mechanism: the model can decide which previous state to retrieve based on what it is currently trying to write.

5. **Stock-H current-query attention**

   The first attention variants used full H-cycle BPTT, which made them more expensive and also changed the training regime. So I added a Stock-H variant: keep stock TRM's H-cycle gradient boundaries, but add current-query attention.

   This tests whether attention over previous H states could work under the original TRM training structure, without paying the cost of full H-cycle backprop.

To see whether a model uses its attention at all in the most basic sense, looking at the attention weights is sufficient. But to evaluate causal use (is the attention load bearing for the computation) I designed a few interventions to perturb the previous hidden states:

- No condition: normal inference (ran twice to ensure consistency)
- Zero history: replace both previous H states, H1 and H2, with zeros
  - Tests effect when H1 and H2 are out of distribution and carry no information.
- Batch shuffle history: replace H1 and H2 with H states from other examples in the same batch
  - Tests effect when H1 and H2 are in distribution and carry misleading information.
- Reverse slots: swap H1 and H2
  - Tests whether the order matters.
- Random history: replace H1 and H2 with gaussian noise matching their mean/std.
  - Tests effect when H1/H2 replaced with statistically matched noise (not exactly in distribution in that these are not real states but not as out of distribution as zeroing).
- Current only mask: base update only, skip the computation incorporating previous H state info altogether.
  - Tests effect when attention computation is skipped.
- Ablate H1: zero only H1
  - Tests specific effect of H1 demolition.
- Ablate H2: zero only H2
  - Tests specific effect of H2 demolition.

My arbitrary thresholds were as follows:

- prediction-change rate over valid output cells `>= 0.005`, or
- absolute exact-accuracy delta `>= 0.02`.

### Results

| Intervention                                       | Benchmark performance                        | Causal intervention readout                                                                                                                                                                                                                                                                                       | Prev State <br>Attention use?                                                                                                                                        |
| -------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original transformer-based TRM reported scores$^1$ | 85.3% maze, 74.7% sudoku                     | -                                                                                                                                                                                                                                                                                                                 | -                                                                                                                                                                    |
| Recipe-matched stock TRM repro                     | 84.6% best / 83.4% latest maze; 73.5% sudoku | Not applicable: no added previous-state attention path.                                                                                                                                                                                                                                                           | No added previous-state attention. Local stock control under the matched recipe, so variant differences are not attributable only to recipe/hyperparameter mismatch. |
| Full H-cycle (BPTT) control                        | 82.8% maze                                   | -                                                                                                                                                                                                                                                                                                                 | -                                                                                                                                                                    |
| Baseline linear history mix                        | 3 maze seeds: 59.1%, 82.3%, 76.1%            | On the H3 readout, `zero_history`, `batch_shuffle_history`, `random_history`, `current_only_mask`, `ablate_h1`, and `ablate_h2` changed about 0.010%-0.012% of valid cell predictions; `reverse_slots` changed 0.027%. Exact deltas stayed below the 2pp floor.                                                   | No attention mechanism. The learned linear history path was not load-bearing under the causal history-use gate.                                                      |
| Fixed-query attention over previous states         | 81.9% best maze                              | On the H3 readout, `zero_history`, `batch_shuffle_history`, `random_history`, and `current_only_mask` changed only about 0.0009%-0.0043% of valid cell predictions; `reverse_slots` changed 0%. Exact accuracy did not move.                                                                                      | Sub-threshold logit sensitivity only. The model had nonzero attention weights, but perturbing H1/H2 did not meaningfully change predictions or task accuracy.        |
| Current-query attention over previous states       | 3 maze seeds: 85.5%, 82.1%, 55.6%            | On the H3 readout, `zero_history`, `batch_shuffle_history`, `random_history`, and `current_only_mask` changed about 0.009%-0.015% of valid cell predictions; `reverse_slots` changed 0%. Exact deltas stayed below the 2pp floor.                                                                                 | Sub-threshold prev-state attention use. Current-query attention did not rescue the fixed-query null result on Maze.                                                  |
| Stock-H current-query attention                    | 68.8% sudoku                                 | `zero_history` changed 4.6% of cell predictions, `batch_shuffle_history` 6.7%, `random_history` 5.5%, and `current_only_mask` 4.6%; `ablate_h1` and `ablate_h2` each changed about 5%. `reverse_slots` changed 0%. Exact accuracy was unchanged or slightly higher but below threshold depending on intervention. | Residual history-path use at token level, but not content-selective H1-vs-H2 use and not puzzle-level correctness improvement.                                       |

$^1$ _The TRM paper got better Sudoku performance for an MLP-based TRM. The history mechanisms I test here are backbone-agnostic, but I evaluate them only on the transformer-based TRM._

For most of the models, attention showed almost no causal effect, neither clearing the cell level prediction change threshold nor the absolute accuracy change threshold. For the Stock-H current-query attention model, many of the interventions produced cell level prediction changes well above threshold, but exact accuracy either didn't change at all or went slightly up (below threshold). So this model used the attention mechanism causally at a token level but it was useless accuracy-wise.

Given no indication of performance gain even with the large seed variance, I called it before finishing all the experiments across maze and sudoku. I conclude that, at the level of a single ACT step, adding attention over previous states doesn't seem to be useful to TRM versus the base architecture.

Let's take a closer look and characterize what's actually happening in the TRM.

## What's actually happening in the maze TRM

First, let's come up with a way to look inside the model's thoughts. Rolling out a single H step, we can visualize the process below:

![[H-step.png]] Fig. 4: Visualization of a rolled out H-update loop.

Recall also the reverse embedding block we apply to $z_H$ to get our desired output $y$. In the maze setting, by default one ACT-step is 3 H-steps, so during training and at inference time, this reverse embedding is only applied each 3 H-steps. By applying it to each updated $z_H$ state, we can see what the model was thinking the answer would be at each H-step. But how do we understand what the model was thinking at each L-step?

We can extend our logic, and also apply the H-update followed by the reverse embedding where it usually isn't applied. So after each L-step, we can run an H-update, put the output $z_H$ into the reverse embedding block, and check the model's output if it were to stop there. Of course, if we're applying this after an L-step, we'll throw away the counterfactual H-update to preserve familiar inference conditions. So without altering the inference at all, we can visualize the model's proposed solution at any step.

![[counterfactual-probe.png|426]] Fig. 5: Visualization of the module used for counterfactual decoding.

_Note: decoding intermediate L-steps was not part of the training objective so this is not equivalent to visualizing the model's thoughts, but it does appear to produce results roughly continuous with the H-step visualizations._

What do we see?

![[example-maze-rollout.png]] Fig. 6a: Example TRM maze rollout including counterfactually decoded intermediate steps.

![[example-maze-rollout-2.png]] Fig. 6b: Example TRM maze rollout including counterfactually decoded intermediate steps.

States through the first committed H update look somewhat nonsensical. My current hypothesis is that the first H update primarily primes the next low-level update rather than directly representing a decodable solution. The key transition occurs at H1 L1: this is the first counterfactual H readout computed from a z_L that has been updated using a non-init z_H. From then on, the counterfactual readouts look like increasingly reasonable working maze solutions.

In terms of overall strategy, the model seems to create a bunch of candidate islands, then cull and merge them until it has the correct path. Looking at the number of connected components in Fig. 7a (ignoring the nonsensical-looking data before the first real H-state), confirms the model does indeed start with many disconnected path components and converges toward a single path component. I can't say for sure because these visualizations are kind of cobbled together, but the model does not appear to be doing something like BFS.

The number of predicted path cells stays roughly constant from H1L2 through H3, about 113.2 to 112.1 cells per maze, while the mean number of predicted path islands falls from 7.99 to 1.27. To decrease the number of islands while using the same number of path cells, the model must be adding and removing path cells at the same time.

Splitting by ultimately correct vs ultimately incorrect mazes (Fig. 7b) we see essentially the same shape, indicating this is a general strategy.

![[path-length-decreases.png]] Fig. 7a: mean path islands at each given counterfactual and real model step. 1-indexed, H1L2 means we've run 1 full H step + 2 L steps before decoding.

![[path-length-separated.png]] Fig. 7b: mean path islands separated by ultimately correct/ultimately incorrect model prediction.

If we look more closely at a couple of rollouts, we can actually see explicit examples of the model doing what looks like local backtracking from a previous bit of path to a new current more correct one. One vague thought I had about attention over previous states was that it might enable things like backtracking, but, at a local level backtracking seems already to be happening.

![[backtracking1.png|697]] Fig. 8a: Example of what appears to be local backtracking. Yellow indicates cells changed from the previous state.

![[backtracking2.png]] Fig. 8b: Example of what appears to be local backtracking.

## How is information carried in TRM?

The only pieces of information that are passed from one forward pass to the next are the two hidden states $z_H$ and $z_L$. I was curious to run some ablations to see how interfering with these states would affect prediction accuracy.

I tested the following interventions:

- Zero: replace both $z_H$ and $z_L$ with vectors of zeros
  - Out of distribution, no recoverable information
- Shuffle: replace both $z_H$ and $z_L$ with other $z_H$ and $z_L$ from different input examples
  - In distribution, potentially misleading information
- Zero $z_H$: replace $z_H$ with a vector of zeros
  - Specifically ablate $z_H$, out of distribution
- Zero $z_L$: replace $z_L$ with a vector of zeros
  - Specifically ablate $z_L$, out of distribution
- Reset both init: reset both $z_H$ and $z_L$ to their learned initial values
  - In distribution, remove any info specific to this puzzle example
- Reset init $z_H$: reset $z_H$ to its learned initial value
  - Specifically ablate $z_H$, in distribution
- Reset init $z_L$: reset $z_L$ to its learned initial value
  - Specifically ablate $z_L$, in distribution

I tested each of these under two conditions:

- Single boundary application: apply intervention at H step $i$ before continuing normally
- Chronic application: apply intervention at every H step except the last

Due to compute constraints, I tested with 16 H steps each rather than the full inference setting of 48 total H updates. Since most of the accuracy is present after the first few H updates, this should still give useful information.

![[single-boundary-intervention.png]] Fig. 9: Final model accuracy after single boundary intervention application at each H update.

![[chronic-intervention.png]] Fig. 10: Final model accuracy after chronic intervention application.

Looking at Fig. 9, we see the following:

- The maze model is most robust to early interventions, hardly losing accuracy when given at least 4 steps to recover. This makes sense since the maze model takes only 4 H-steps to get to 99% of its eventual accuracy while the sudoku models take 16 H-steps (attn) and 43 H-steps (mlp) respectively.
- Messing with $z_L$ has almost no effect on accuracy regardless of when it's done on all three models. This implies the model likely holds context about overall progress in $z_H$. This is expected given $z_H$ is the sole input to the prediction head.
- Messing with $z_H$ soon before readout tanks accuracy in general. But specifically in the case of resetting $z_H$ to $z_H^{init}$ even after the 15th H step on the sudoku MLP model doesn't compromise accuracy. That specific model may be making use of $z_L$ in addition to $z_H$ to store information about global progress. I credit this effect applying on init reset but not on zeroing to zeroing producing an out of distribution state.

Looking at Fig. 10, we see the following:

- Chronic application of any non $z_L$ specific intervention totally destroys accuracy.
- Chronic application of zeroing or resetting $z_L$ has a much less drastic destructive effect on accuracy especially with respect to the sudoku mlp and maze TRMs.

These results suggest that, as expected given its role as sole input to the prediction head, $z_H$ rather than $z_L$ acts as the dominant carrier of load bearing state across H cycles.

## Limitations

There are a few limitations to this analysis.

- Inter-seed variance was high but I only ran a few seeds for the attention over previous states models due to compute constraints. I also left out some variations like Stock-H maze and current-query sudoku.
- The counterfactual probes are a useful hack rather than a native visualization method.
- I only ran the information carry experiments on a single checkpoint per training recipe.
- The backtracking analysis is qualitative.

## Conclusion

I implemented a few variations of attention over previous states and found no benefit to overall accuracy, even in the case where the model actually used the attention mechanism. Taking a closer look at what's actually happening in the model, I discovered a general parallel create segments -> refine and connect strategy in the maze TRM and a reliance on $z_H$ over $z_L$ for carrying information across H steps.

While none of these findings are individually surprising, the negative previous state attention result is consistent with $z_H$ being a sufficient running summary for these tasks.

I factored out the most interesting result of my analysis about the strategy of the halting head into [another post](https://www.nabilbaugher.com/blog/trm-halting-head).

## Citations

- Wang, G., Li, J., Sun, Y., Chen, X., Liu, C., Wu, Y., Lu, M., Song, S., & Abbasi Yadkori, Y. (2025). _Hierarchical Reasoning Model_. arXiv:2506.21734. — introduces the Maze-Hard benchmark.
- Jolicoeur-Martineau, A. (2025). _Less is More: Recursive Reasoning with Tiny Networks_. arXiv:2510.04871. — the TRM paper.
- Kimi Team (Chen, G., et al.) (2026). _Attention Residuals_. arXiv:2603.15031. — the attention-over-residual-states (AttnRes) work that loosely inspired the previous-state attention variants here.
- Lehnert, L., Sukhbaatar, S., et al. (2024). _Beyond A\*: Better Planning with Transformers via Search Dynamics Bootstrapping_ (Searchformer). arXiv:2402.14083. — source of the maze-generation setup.
- Sghaier, A., Parviz, A., & Jolicoeur-Martineau, A. (2026). _Probabilistic Tiny Recursive Model_ (PTRM). arXiv:2605.19943. — uses the Q head as a verifier (discussed in the companion post).
