The recent Hierarchical Reasoning Model (HRM) paper brought a lot of buzz with its release. Its neuro-inspired recursive/hierarchical design and 27M parameter count drew attention given its strong [32% on the ARC-AGI 1 semi-private benchmark](https://arcprize.org/blog/hrm-analysis). The Tiny Recursive Model (TRM) paper quickly followed, stripping it down to a simpler, single module recursive setup and [scoring 40% on the same benchmark](https://x.com/arcprize/status/1978872651180577060) with only 7M params. The paradigm is compelling. Use a recursive model to iteratively update its understanding in the latent space, then decode after allowing iterative latent thought.

My initial hypothesis was that by giving the model the opportunity to attend to previous states, it may learn to backtrack (restore a previous state if the direction to get to the current state seemed incorrect) or find some other useful function for the attention. The approach was loosely inspired by the recent Kimi Attention Residuals paper which introduced attention over residual states in language modeling.

Attention over previous states was not load-bearing for task performance, so instead I mapped TRM's existing mechanisms and tested PTRM's verifier claim with a stricter design.

# What is a Tiny Recursive Model?

The idea behind the TRM is that a small, recursively applied model can iteratively improve its prediction, outperforming a larger single-pass model. The core model is a pretty typical 2-layer transformer (or MLP for Sudoku).

![[trm-block.png|303]]
Fig. 1: The core model underlying the TRM.

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

![[trm.png]]
Fig. 2: The recursive structure of TRM. $x + z_H + z_L$ indicates element-wise addition.

Figure 2 shows the process a TRM takes during inference. The low level state is updated $n$ times for each high level update, the high level state is updated $T$ times for each ACT step, and 16 ACT steps are run at inference time. In this analysis I'll focus on the maze task. The paper's settings for maze are $n=4$, $T=3$, and $A=16$. So to predict a given maze's path at inference time, we run $(4+1)*3*16=240$ model inference steps.

At training time, to avoid full backpropagation through time which would be too computationally expensive with this many steps, TRM detaches gradient until the last $T$-step in each ACT. ACT steps are run sequentially, calculating loss and updating model between steps. A supervised Q-head is used during training to detect whether or not the maze is solved and no further ACTs need to be run to save useless training time. Note: the Q-head is not used for early stopping at test time.

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

# Implementing attention over previous states

My initial hypothesis was that TRM might benefit from a small amount of memory over its own high-level states. In stock TRM, each H-cycle overwrites the previous high-level state $z_H$. That means if an earlier H-cycle found a useful partial structure, the model has to preserve it inside the current state or lose it. I wondered whether letting the model explicitly look back at previous $z_H$ states would help. One possible idea I had in mind was backtracking. Maybe the model would learn how to discard a poor current trajectory in favor of returning to a previous high level state.

I tested a few variants. In all of them, the history was bounded within a single ACT step. For Maze-Hard, one ACT step has three H-cycles, so the history available at H-cycle $t$ is only $\{z_H^1, \ldots, z_H^{t-1}\}$. It does not attend over previous ACT steps. Previous ACT steps still enter only through TRM's normal detached carry.

Let $b_t$ be the ordinary TRM high-level update at H-cycle $t$, after the low-level state has already been updated $n$ times:

$$
b_t = f_\theta(z_H^{t-1} + z_L^t)
$$

The variants differ in how they modify this base update.

1. **Full H-cycle Backprop Through Time (BPTT) control**

   Stock TRM runs the early H-cycles under `no_grad` and only backprops through the final H-cycle. Before testing attention, I needed a control that simply removed this truncation:

   $$
   z_H^t = b_t
   $$

   but with gradients flowing through all H-cycles inside the ACT step.

   This asks: if performance changes, is it because attention over history helped, or just because the model got better credit assignment through the H-cycle loop?

2. **Baseline linear history mix**

   This was the simplest memory baseline. For H-cycles 2 and 3, define memory as the mean of previous high-level states in the current ACT step:

   $$
   \text{mem}_t = \frac{1}{t-1}\sum_{j < t} z_H^j
   $$

   Then update:

   $$
   z_H^t = \text{RMSNorm}(b_t + \alpha \cdot \text{mem}_t)
   $$

   where $\alpha$ is a learned scalar initialized near zero.

   This tests the effect of the most basic level of previous state preservation.

3. **Fixed-query attention over previous states**

   The fixed-query version gives each H-cycle a learned query vector. For H-cycle $t$:

   $$
   q_t = \text{learned query vector for cycle } t
   $$

   Previous high-level states become keys and values:

   $$
   k_j = \text{RMSNorm}(z_H^j), \quad v_j = z_H^j
   $$

   Attention weights are:

   $$
   w_{t,j} = \text{softmax}_j \left( \frac{q_t \cdot k_j}{\sqrt{d}} \right)
   $$

   and the memory is:

   $$
   \text{mem}_t = \sum_{j < t} w_{t,j} v_j
   $$

   Then:

   $$
   z_H^t = \text{RMSNorm}(b_t + \alpha_t \cdot \text{mem}_t)
   $$

   Here the query depends only on the H-cycle index, not on the current example. So this is closer to learning a general schedule like "at H3, look back at H1 vs H2." It is content-aware because the keys come from actual previous states, but the query itself is fixed.

4. **Current-query attention over previous states**

   The more expressive version generates the query from the current base update:

   $$
   q_t = W_q b_t
   $$

   The keys and values are still previous high-level states:

   $$
   k_j = \text{RMSNorm}(z_H^j), \quad v_j = z_H^j
   $$

   Then:

   $$
   w_{t,j} = \text{softmax}_j \left( \frac{q_t \cdot k_j}{\sqrt{d}} \right)
   $$

   $$
   \text{mem}_t = \sum_{j < t} w_{t,j} v_j
   $$

   $$
   z_H^t = \text{RMSNorm}(b_t + \alpha_t \cdot \text{mem}_t)
   $$

   This is the more natural backtracking mechanism: the model can decide which previous state to retrieve based on what it is currently trying to write.

5. **Stock-H current-query attention**

   The first attention variants used full H-cycle BPTT, which made them more expensive and also changed the training regime. So I added a Stock-H variant: keep stock TRM's H-cycle gradient boundaries, but add current-query attention.

   That means:

   ```text
   H1, H2: computed under no_grad
   H3: receives gradient
   H3 can attend over detached H1/H2 states
   ```

   So the formula is still current-query attention over previous states, but the history states are detached:

   $$
   z_H^3 = \text{RMSNorm}(b_3 + \alpha \cdot \text{Attn}(W_q b_3, \{z_H^1, z_H^2\}))
   $$

   This tests whether attention over previous H states could work under the original TRM training structure, without paying the cost of full H-cycle backprop.

## Results

| Intervention                                 | Benchmark performance             | Prev State<br>Attention use?                                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original TRM                                 | 84.3% maze, 73.5% sudoku          | -                                                                                                                                                                                                                                   |
| Full H-cycle (BPTT) control                  | 82.8% maze                        | -                                                                                                                                                                                                                                   |
| Baseline linear history mix                  | 3 maze seeds: 59.1%, 82.3%, 76.1% | No attention mechanism. History coefficient moved, but no content-dependent attention-use claim.                                                                                                                                    |
| Fixed-query attention over previous states   | 81.9% best maze                   | Interventions to previous states essentially did not change predictions; sub-threshold prev-state attention use.                                                                                                                    |
| Current-query attention over previous states | 3 maze seeds: 85.5%, 82.1%, 55.6% | Interventions to previous states only changed 0.004%–0.015% of cell predictions; sub-threshold prev state attention use                                                                                                             |
| Stock-H current-query attention              | 68.8% sudoku                      | Interventions to previous states changed 4.6%–6.7% of cell predictions and produced large logit shifts, but did not degrade exact accuracy. So history attention was used, but not in a way that improved puzzle-level correctness. |

Given no indication of performance gain or task-load-bearing attention use even with large inter-seed variance, I called it before finishing all the experiments across maze and sudoku. I conclude that, at the level of a single ACT step, adding attention over previous states doesn't seem to be useful to TRM versus the base architecture.

Let's take a closer look and characterize what's actually happening in the TRM.

I called these runs early after seeing no performance gain and no causal use of the attention.

# What I think is happening

> Q head verifier is legit: The PTRM paper claims that the Q head can be used as a verifier

# Introducing the counterfactual probe

visualize intermediate states, characterize n islands starting large and decreasing, visualize q5 model

#
