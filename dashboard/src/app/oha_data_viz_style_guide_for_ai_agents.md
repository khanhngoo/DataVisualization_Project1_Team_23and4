# OHA Data Visualization Style Guide — AI Coding Agent Markdown

## Purpose

This document converts the **Office of HIV/AIDS (OHA) Data Visualization Style Guide (2024)** into an implementation-ready markdown spec for AI coding agents that generate dashboards, charts, or review visualizations.

Use this as a **design and QA checklist** when creating or critiquing data visualizations.

---

## 1) Core objective

Every visualization should:
- communicate a clear takeaway
- reduce clutter
- use color intentionally
- provide enough context to interpret the chart correctly
- rely on visual hierarchy so the most important information stands out

The guide frames the principles in four groups:
1. **Show the data**
2. **Be intentional**
3. **Provide context**
4. **Rely on visual hierarchy**

---

## 2) Global defaults for AI-generated charts

### 2.1 Canvas and sizing
- Default output size: **5.625 x 10 inches** to fit a **16:9 slide**
- Prefer clean, flat, 2D visuals
- Avoid ornamental effects

### 2.2 Typography
Preferred font stack:
1. **Source Sans 3**
2. **Arial**
3. **Gill Sans MT**

Recommended hierarchy:
- **Title**: 14 pt, bold, uppercase, dark text
- **Subtitle**: 12 pt, sentence case
- **Axis / direct labels**: 10–11 pt
- **Source / notes**: 9 pt, light gray

### 2.3 Chart element colors
Recommended non-data text / scaffolding colors:
- **Title**: `#202020`
- **Body / subtitle / labels**: `#505050`
- **Source / notes**: `#909090`
- **Gridlines**: `#D3D3D3`
- **Shaded annotation area**: `#EBEBEB`

---

## 3) Title, subtitle, caption, annotation rules

### 3.1 Title
The title must state the **takeaway message**, not merely describe the chart.

Good:
- `INDEX TESTING FELL IN FY50Q1`
- `BULLS OPTIMIZED TESTING, DECREASING TESTS WHILE INCREASING POSITIVITY`

Bad:
- `Tests by quarter`
- `Partner performance`

### 3.2 Subtitle
Use the subtitle to add context:
- timeframe
- unit of analysis
- geography
- integrated legend
- axis clarification if needed

### 3.3 Caption / footer
Put source and caveats in the **lower right corner**. Include:
- data source
- date
- caveats / notes
- reference ID if available

### 3.4 Annotation
Annotations should:
- clarify the story
- be subtle
- use thin strokes
- avoid colored boxes
- avoid overpowering the marks

Prefer light gray arrows or small notes. Do not annotate every point.

---

## 4) Non-negotiable design rules

### 4.1 Remove chart junk
Never add:
- unnecessary borders
- thick axis lines
- decorative backgrounds
- large legends when direct labeling is possible
- redundant labels
- excessive tick marks

### 4.2 No 3D charts
Do not generate:
- 3D pie charts
- 3D bars
- perspective effects

### 4.3 Avoid dual axes
Do not place two unrelated scales on one chart unless there is an exceptional reason.
Preferred alternatives:
- separate charts
- vertically stacked panels
- small multiples

### 4.4 Keep text horizontal
Axis labels and category labels should remain horizontal whenever possible.
Avoid:
- vertical labels
- 45-degree labels

### 4.5 Clean numbers
- round where appropriate
- avoid false precision
- use thousands separators
- use decimals only when analytically necessary

### 4.6 Intentional ordering
Never leave categorical order alphabetical by default unless alphabetic order is the point.
Preferred ordering:
- descending or ascending by value
- chronological
- grouped by meaning
- sorted to emphasize the takeaway

---

## 5) Chart-type guidance for AI agents

### 5.1 Use bars for magnitude comparisons
Best for:
- comparisons across categories
- rankings
- differences in size

Rules:
- bar charts must start at zero
- use direct labels when feasible
- sort bars intentionally

### 5.2 Use line charts for change over time
Best for:
- continuous time series
- showing trajectory

Rules:
- avoid spaghetti plots
- if many lines exist, gray out most and highlight one focal line
- label key lines directly rather than relying on a distant legend

### 5.3 Use small multiples for many categories
Use small multiples when:
- many categories overlap in one view
- a stacked chart becomes unreadable
- a multi-line chart becomes cluttered

### 5.4 Use tables when precision matters
Tables are preferred when:
- exact values matter more than pattern
- multiple precise figures must be communicated

Table rules:
- right-align numbers
- use separators and percent symbols consistently
- use limited decimals
- use color sparingly
- keep text horizontal
- make the title informative

### 5.5 Avoid stacked charts unless the structure truly helps
Avoid stacked bars with many segments because comparison is difficult without a common baseline.

### 5.6 Target achievement views
For target achievement:
- show magnitude and achievement clearly
- use subtle target context (reference line, light background target bar, or bullet-chart style)
- do not connect distinct achievement percentages into a fake trend line unless time is actually involved

---

## 6) Color system rules

## 6.1 General philosophy
Color must be:
- intentional
- sparse
- meaningful
- consistent

Default workflow:
1. Start in black and white
2. Add color only where it improves comprehension
3. Highlight the key series
4. Gray out supporting context if needed

## 6.2 OHA palette

### Primary colors
- Midnight Blue `#15478A`
- Viking `#5BB5D5`
- Slate `#8C8C91`

### Secondary colors
- Electric Indigo `#3B5BBE`
- Orchid Bloom `#E14BA1`
- Sun Kissed `#F9C555`
- Hunter `#419164`
- Lavender Haze `#876EC4`
- Tango `#F36428`

### USAID brand colors
- USAID Blue `#002F6C`
- USAID Red `#BA0C2F`
- Medium Blue `#0067B9`
- Rich Black `#212721`
- Light Gray `#CFCDC9`
- Light Blue `#A7C6ED`

## 6.3 Palette usage rules
- For external-facing plots, default to **USAID branding colors**
- For OHA visual products, use the **approved OHA palette**
- Default starting palette for simple plots: **Midnight Blue, Viking, Slate**
- When encoding many categories, use the **secondary palette**
- Avoid mixing primary and secondary palettes in the same chart unless using the prescribed symbology system
- Slate may be used as a neutral fill or stroke

## 6.4 Symbology rules

### Agency encoding
- USAID: Midnight Blue `#15478A`
- CDC: Viking (60%) `#9DD3E6`
- DoD: Hunter (60%) `#8DBDA2`
- Peace Corps: Lavender Haze (60%) `#B7A8DC`
- Other: Slate (60%) `#BABABD`

### Sex encoding
- Female: Lavender Haze `#876EC4`
- Male: Hunter `#419164`
- Unknown: Slate (60%) `#BABABD`

### Target achievement encoding
- `< T-25%`: Tango (60%) `#F8A27E`
- `T-25% to T-10%`: Sun Kissed (60%) `#FBDC99`
- `T-10% to T+10%`: Viking `#5BB5D5`
- `> T+10%`: Electric Indigo (80%) `#697EBC`

## 6.5 Quantitative color ramps
For sequential or diverging palettes:
- ensure sufficient contrast between steps
- use well-spaced lightness differences
- consider distribution shape before applying color bins
- document statistical transformations if used

---

## 7) Accessibility rules

## 7.1 Contrast
Ensure:
- text is readable against the background
- labels on bars / marks remain legible
- graphic objects have enough contrast against the background and against one another

Operational minimums from the guide:
- roughly **4:1 for small text**
- roughly **2.5:1 for large text**
- **3:1 for graphic objects**

## 7.2 Colorblind compatibility
- Do not rely on red/green stoplight encoding
- Use the approved color-blind safe palette
- Validate palette choices for categorical comparisons
- Do not rely on color alone; use labels, position, grouping, or pattern where possible

## 7.3 Alt text
For public or shared documents, include alt text.
Recommended structure:
- `<Chart type> of <type of data> where <reason for including the chart>.`

## 7.4 Text clarity
Avoid:
- light gray text on white
- labels placed over fills without adequate contrast
- subtle tones for annotation text if they become unreadable

---

## 8) Context rules

### 8.1 Reference lines and regions
Use reference lines or shaded regions when they add interpretive value:
- average
- target
- benchmark
- policy period
- intervention period

Label the reference directly.

### 8.2 Axis rules
- consistent intervals
- even spacing
- no misleading truncation
- bar and area charts start at zero
- if a non-zero baseline is used elsewhere, explain it clearly

### 8.3 Legends
Preferred order:
1. direct labels
2. legend integrated into title or subtitle
3. separate legend only when necessary

If direct labels are used, remove redundant axis text where possible.

---

## 9) Dashboard-specific guidance for AI agents

When generating dashboards:

### 9.1 Use a consistent family appearance
All charts in the dashboard should look related:
- same font family
- same label styles
- same title treatment
- same spacing logic
- same gridline treatment
- same color semantics

### 9.2 Prioritize scannability
A dashboard should allow fast scanning:
- a takeaway title on each chart
- minimal clutter
- aligned chart frames
- consistent axes and spacing
- only one or two focal colors per view

### 9.3 Avoid overplotting
If density becomes too high:
- move to small multiples
- reduce categories per view
- gray background series
- allow filtering rather than showing everything at once

### 9.4 Highlight only what matters
Use strong color only for the key signal.
Everything else should be de-emphasized using:
- gray
- lighter stroke
- lower opacity
- smaller label emphasis

---

## 10) Ethical and inclusive design rules

AI agents must avoid visual choices that:
- reinforce stereotypes
- imply one demographic is the default norm
- obscure uncertainty
- hide missing groups
- mislead through grouping or ordering

Required behaviors:
- be thoughtful about category order
- note uncertainty or limitations
- consider who is missing from the dataset
- use inclusive language
- be careful when comparing sensitive populations

---

## 11) QA checklist for AI-generated visualizations

Before finalizing any chart, verify:

### Messaging
- [ ] Does the title state the takeaway?
- [ ] Does the subtitle add useful context?
- [ ] Is the chart answering a clear question?

### Clutter
- [ ] Are unnecessary borders removed?
- [ ] Are thick lines removed?
- [ ] Are tick marks minimized?
- [ ] Is chart junk absent?
- [ ] Is the chart 2D?

### Structure
- [ ] Is the chart type appropriate?
- [ ] Are categories intentionally ordered?
- [ ] Are bar charts starting at zero?
- [ ] Are intervals consistent?
- [ ] Is dual-axis avoided?

### Text
- [ ] Is all text horizontal where possible?
- [ ] Are fonts consistent?
- [ ] Are numbers rounded and formatted?
- [ ] Are direct labels used when feasible?

### Color
- [ ] Is color used intentionally rather than decoratively?
- [ ] Does the chart use approved colors?
- [ ] Is the focal series highlighted and context muted?
- [ ] Is contrast sufficient?
- [ ] Is colorblind accessibility considered?

### Context
- [ ] Are annotations useful and subtle?
- [ ] Are reference lines or targets labeled?
- [ ] Is source / note information included?
- [ ] Would alt text be needed for distribution?

---

## 12) Critique template for AI coding agents

Use this structure when reviewing a dashboard or chart:

### What follows the guide
- Notes on takeaway title
- Intentional ordering
- Effective use of emphasis
- Clean typography
- Good annotation / source treatment

### What violates the guide
- Any dual axis
- Decorative clutter
- weak contrast
- too many colors
- legend dependence
- non-zero bar baseline
- unreadable labels
- poor hierarchy

### Recommended fixes
- replace chart type if needed
- sort categories intentionally
- reduce color count
- directly label focal series
- add subtitle / caption / source
- improve contrast
- convert dense views into small multiples

---

## 13) Implementation heuristics for coding agents

When auto-generating a chart:
1. Identify the chart’s message
2. Select the simplest valid chart type
3. Remove all non-essential decoration
4. Use one primary emphasis color
5. De-emphasize supporting data in gray
6. Write a takeaway title
7. Add context in subtitle and notes
8. Check contrast and label readability
9. Validate baseline, ordering, and scale logic
10. Export with consistent typography and spacing

---

## 14) Preferred defaults by scenario

### Single-series bar chart
- color: Midnight Blue
- sorted descending if ranking
- zero baseline
- direct labels optional
- faint gray gridlines

### Multi-series time trend
- gray all series
- highlight one focal line in Midnight Blue, Hunter, or Lavender Haze
- direct label focal line
- avoid separate legend if possible

### Many-category comparison
- use small multiples
- common scale across panels
- aligned axes
- concise panel titles

### Target achievement chart
- show target as light reference bar or reference line
- color actuals by achievement bucket
- label percent achievement clearly
- avoid unnecessary second axis

---

## 15) Source

Derived from the uploaded **OHA Data Visualization Style Guide (Office of HIV/AIDS, 2024)**.
