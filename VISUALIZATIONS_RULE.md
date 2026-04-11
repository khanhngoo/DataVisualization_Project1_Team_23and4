# OHA Data Visualization Style Guidelines (2024)

These rules ensure all visualizations are consistent, professional, and accessible.

---

## 1. General Plot Anatomy & Layout
* [cite_start]**Dimensions:** Set default visual size to **5.625" x 10"** to fit a 16:9 slide ratio[cite: 352].
* [cite_start]**Dimensions:** Use **two-dimensional (2D)** graphics only; avoid 3D effects as they distort data[cite: 427, 428].
* [cite_start]**Data-Ink Ratio:** Maximize data-ink by removing "chart junk" such as plot borders, thick lines, and unnecessary tick marks[cite: 397, 398, 401].
* [cite_start]**Text Direction:** Axis text and labels must **always be horizontal**; never vertical or angled[cite: 364, 507, 1116].
* **Gridlines:** Use sparingly. [cite_start]When included, they should be faint gray (#D3D3D3)[cite: 373, 722].
* [cite_start]**Captions:** Include data source, date, and reference IDs in the lower right-hand corner in a light shade of gray[cite: 379, 385].

## 2. Titles, Subtitles, and Legends
* [cite_start]**Informative Titles:** Titles must convey a **take-away message** (e.g., "INDEX TESTING FALLS") rather than just describing the data[cite: 353, 354, 543].
* [cite_start]**Title Formatting:** Use **ALL UPPER CASE**, left-aligned with the y-axis label[cite: 355].
* **Subtitles:** Use to provide additional context (periods covered, units). [cite_start]Format in sentence case, not bolded or italicized[cite: 356, 357, 547, 548].
* **Integrated Legends:** Avoid standalone legend boxes. [cite_start]Use **direct labeling** on the chart or integrate the legend into the title by coloring text to match data categories[cite: 359, 486, 488].

## 3. Typography & Sizing
* [cite_start]**Primary Typeface:** **Source Sans 3**[cite: 580, 620].
* [cite_start]**Alternatives:** Arial or Gill Sans (if Source Sans 3 is unavailable)[cite: 580, 621].
* **Hierarchy:**
    * [cite_start]**Main Title:** 14pt Bold, Color: Nero (#202020) [cite: 639-641].
    * [cite_start]**Subtitle:** 12pt, Color: Nero (#202020)[cite: 642, 643].
    * [cite_start]**Direct Labels:** 10pt, Color: Matterhorn (#505050) [cite: 661-663].
    * [cite_start]**Axis Labels:** 10pt, Color: Matterhorn (#505050)[cite: 674, 675].
    * [cite_start]**Annotations:** 9pt, Color: Matterhorn (#505050)[cite: 658, 659].
    * [cite_start]**Source/Notes:** 9pt, Color: Suva Gray (#909090)[cite: 680, 683].

## 4. Color Palettes
* [cite_start]**Primary OHA Colors:** * **Midnight Blue:** `#15478A` (Default starting point)[cite: 703, 820].
    * [cite_start]**Viking:** `#5BB5D5`[cite: 704, 820].
    * [cite_start]**Slate:** `#8C8C91` (Use for secondary data/context)[cite: 705, 746, 820].
* [cite_start]**Secondary Colors:** (Use only when representing 3+ categories) Electric Indigo (`#3B5BBE`), Orchid Bloom (`#E14BA1`), Sun Kissed (`#F9C555`), Hunter (`#419164`), Lavender Haze (`#876EC4`), Tango (`#F36428`) [cite: 707-711, 821].
* **Color Strategy:** "Get it right in black and white" first. [cite_start]Use gray for non-essential data to provide context without distracting from the main point[cite: 462, 464, 856, 859].

## 5. Specific Symbology & Encodings
* [cite_start]**Sex Encoding:** Female (**Lavender Haze #876EC4**), Male (**Hunter #419164**), Unknown (**Slate 60% #BABABD**) [cite: 833-838].
* [cite_start]**Agency Encoding:** USAID (Midnight Blue), CDC (Viking 60%), DoD (Hunter 60%), Peace Corps (Lavender Haze 60%) [cite: 823-832].
* [cite_start]**Target Achievement:** * `< (T-25%):` Tango 60% (`#F8A27E`)[cite: 840, 843].
    * [cite_start]`(T-25%) to (T-10%):` Sun Kissed 60% (`#FBDC99`)[cite: 841, 844].
    * [cite_start]`(T-10%) to (T+10%):` Viking (`#5BB5D5`)[cite: 842, 845].
    * [cite_start]`> (T+10%):` Electric Indigo 80% (`#697EBC`)[cite: 842, 846].

## 6. Data Handling & Chart Selection
* [cite_start]**Sorting:** Always sort categories by value (descending/ascending) rather than alphabetically[cite: 289, 455, 456].
* [cite_start]**Zero Baseline:** Bar and area charts **must always start at zero**[cite: 373, 512].
* [cite_start]**Small Multiples:** Use a grid of small charts instead of "spaghetti" line plots or dense stacked bars to improve comparison[cite: 450, 451, 971, 1079].
* [cite_start]**Avoid Dual Axes:** Dual axes are confusing and can falsely imply relationships; use side-by-side plots instead[cite: 434, 435, 1029].
* **Precision:** Round numbers to avoid false precision. [cite_start]Use comma separators for thousands (e.g., 1,000)[cite: 430, 431, 432].

## 7. Annotations & Context
* **Tone:** Use annotations to tell the "why" behind the data. [cite_start]Write in complete sentences[cite: 373, 554, 555].
* [cite_start]**Visual Style:** Use thin gray arrows; avoid bold boxes around text[cite: 377, 557, 582, 585].
* [cite_start]**Reference Lines:** Use labeled lines or shaded areas to denote averages or specific time events[cite: 551, 552].

## 8. Ethics & Inclusive Design
* [cite_start]**Language:** Refer to **"missions"** (not "field") and **"positivity"** (not "yield")[cite: 932, 933].
* [cite_start]**Alt-Text:** Use the formula: `[Chart type] of [type of data] where [reason for including chart]`[cite: 910].
* [cite_start]**Accessibility:** Ensure a contrast ratio of at least 4.5:1 for small text and 3:1 for graphical objects against the background[cite: 590, 918].
* [cite_start]**Equity:** Avoid default sorting that reinforces "white" or "male" categories as the norm; make deliberate, empathetic ordering choices[cite: 889, 890, 926].

# Some kinds of charts

## 1. Quantitative Data (Numerical Data)
Used for measurable and calculable data (e.g., revenue, temperature, or patient counts).

### A. Trends Over Time (Time Series)
* [cite_start]**Line Chart:** The standard technique for tracking change, growth, or fluctuations over time[cite: 196]. 
    * [cite_start]*OHA Rule:* Avoid "spaghetti plots" with too many overlapping lines; use **Small Multiples** or highlight one focal trend in **Midnight Blue (#15478A)** while others stay in **Slate (#8C8C91)**[cite: 1077, 1080, 1081].
* **Area Chart:** Used to emphasize the magnitude of change or cumulative totals.
    * [cite_start]*OHA Rule:* Area charts **must always start at a zero baseline**[cite: 512].

### B. Distribution
* **Histogram:** Shows the frequency of data within specific intervals (bins). 
    * [cite_start]*OHA Rule:* Useful for checking if data is skewed before applying color gradients[cite: 479, 480].
* [cite_start]**Box Plot:** Summarizes data through quartiles, medians, and outliers[cite: 373]. Excellent for comparing variation between groups.

### C. Relationships
* [cite_start]**Scatter Plot:** Uses X-Y coordinates to find correlations between two variables[cite: 134]. 
    * [cite_start]*OHA Rule:* Recommended for comparing site-level indicators or overplotting issues[cite: 171, 453].
* [cite_start]**Bubble Chart:** An advanced scatter plot where the "bubble" size represents a third variable[cite: 140].

---

## 2. Qualitative Data (Categorical Data)
Describes characteristics or categories (e.g., country names, product types, or satisfaction levels).

### A. Comparison Between Categories
* [cite_start]**Bar/Column Chart:** The most effective technique for comparing magnitudes between groups[cite: 157, 162].
    * [cite_start]*OHA Rule:* Bar charts **must always start at zero**[cite: 373, 512]. [cite_start]Use horizontal bars when category labels are long to keep text **horizontal**[cite: 364, 1117].
* **Lollipop Chart:** A slender variation of the bar chart used to reduce visual "heaviness" when many categories are present.

### B. Composition & Proportions (Part-to-Whole)
* **Pie & Donut Charts:** Show percentages of a total. 
    * *OHA Rule:* Generally discouraged. [cite_start]Use **Treemaps** or **Bar Charts** instead to make comparisons easier for the reader[cite: 169].
* [cite_start]**Treemap:** Uses nested rectangles to show hierarchical structures and proportions[cite: 158]. Effective for large, complex datasets.

---

## 3. Specialized Data
* [cite_start]**Geospatial (Maps):** Use **Choropleth Maps** to color territories based on data values (e.g., treatment coverage by district)[cite: 191, 202].
* **Textual Data:** **Word Clouds** display words with sizes based on frequency.
* **Multi-dimensional / Process:**
    * [cite_start]**Heatmap:** Uses color intensity in a matrix to identify "hot spots" quickly[cite: 1332]. 
        * [cite_start]*OHA Rule:* Ensure color gradients have enough contrast and steps between colors are optimized for accessibility[cite: 476, 477].
    * [cite_start]**Sankey Diagram:** Visualizes flows between stages (e.g., budget flow or the 95-95-95 cascade)[cite: 152].

---