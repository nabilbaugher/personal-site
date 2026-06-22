## What this is

Cells talk to each other chemically. One cell releases a signaling molecule (a **ligand**), a neighbor catches it with a matching surface protein (a **receptor**), and that catch flips an internal program in the receiving cell (a **pathway**). A cell-cascade model is supposed to simulate this: perturb one cell, watch the effect ripple through the tissue.

BioBench tests whether that ripple looks like real biology. The precise question: **if cell A sends a signal to cell B, does the cascade propagate it the way real cells would?** Crucially, this is *independent* of whether the model predicts clinical outcomes — it isolates one thing: does the model understand intercellular signaling?

## Why this is the right test

It's easy to build a benchmark a model can pass by exploiting correlations in expression data rather than real biology. BioBench is designed to make that hard by grounding every test row in **causal** databases — relationships that are independently documented as "A activates B," not just "A and B move together."

## The three data sources, and what each is for

- **OmniPath** — a curated catalog of known ligand→receptor pairs. Filtered hard: the signal must be activating by consensus, agreed by at least two independent databases, with the ligand a secreted protein and the receptor a surface protein. This removes intracellular proteins that aren't actually doing cell-to-cell signaling.
- **SIGNOR + Reactome** — causal-relationship databases. They establish which receptors genuinely *drive* which pathways, as opposed to merely correlating with them.
- **PROGENy** — a measurement tool, used only at scoring time. It converts a cell's gene-expression profile into an activity score per pathway, so we can check whether the pathway actually turned on in the receiver cell after the cascade ran. It measures the result; it never defines the rows.

## The flipped pipeline

Each row is one testable hypothesis: *ligand L, secreted by cell A, binds receptor R on cell B, which activates pathway P in cell B.* Rows are built in a specific order so the causality is baked in, not assumed:

1. **SIGNOR defines receptor→pathway links.** For each pathway, identify a few well-known "entry-point" proteins that definitively mark it as active (e.g. SMAD2/3 for TGFb, STAT3 for JAK-STAT), then find receptors that directly activate those entry points. A constraint keeps this honest: entry points must be *specific* — shared hubs activated by many pathways are disqualified, because they'd wrongly assign receptors from unrelated pathways.
2. **OmniPath adds the ligand.** For each receptor, supply the high-confidence secreted ligands that bind it — completing the ligand → receptor → pathway chain.
3. **PROGENy measures the result** at test time only.

## The current row set (v3)

137 rows across 9 pathways, after four rounds of progressive tightening:

| Pathway | Rows | What it represents |
| --- | ---: | --- |
| JAK-STAT | 46 | Cytokine signaling — immune cells via interleukins/interferons |
| VEGF | 27 | Blood-vessel growth signals |
| EGFR | 21 | Growth-factor signaling via the ErbB receptor family |
| WNT | 20 | Cell-fate and development signaling |
| PI3K | 8 | Cell survival and growth |
| TNFa | 5 | Inflammatory signaling |
| MAPK | 4 | Cell proliferation |
| TGFb | 3 | Tissue remodeling and immune suppression |
| Trail | 3 | Cell-death signaling |

Several pathways (Androgen, Estrogen, Hypoxia, NFkB, p53) dropped out by construction: their signaling is primarily intracellular or nuclear, so they don't fit the ligand → surface-receptor → pathway structure. Letting them fall out rather than forcing them in is part of what keeps the benchmark clean.

## Status

v3 is implementation-ready and shipped, with a frontend and a training-signal audit. The design is deliberately conservative — it would rather test fewer pathways cleanly than more pathways with shaky causal grounding.
