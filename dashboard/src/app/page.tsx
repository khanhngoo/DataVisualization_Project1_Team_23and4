"use client";

import { usePenguinData, useKMeansValidation } from "@/hooks/usePenguinData";
import { KPICards } from "@/components/KPICards";
import { DistributionDonut } from "@/components/DistributionDonut";
import { PCAScatter } from "@/components/PCAScatter";
import { IslandDistribution } from "@/components/IslandDistribution";
import { SimpsonParadox } from "@/components/SimpsonParadox";
import { EngineScatter } from "@/components/EngineScatter";
import { CorrelationHeatmap } from "@/components/CorrelationHeatmap";
import { DumbbellPlot } from "@/components/DumbbellPlot";
import { KMeansComparison } from "@/components/KMeansComparison";
import { ClusterValidation } from "@/components/ClusterValidation";
import { DimorphismBoxplot } from "@/components/DimorphismBoxplot";
import { SpeciesShowcase } from "@/components/SpeciesShowcase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

function NarrativeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-text-muted my-6 max-w-3xl py-2 text-sm leading-relaxed italic">
      {children}
    </div>
  );
}

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-6 max-w-4xl rounded-3xl border px-5 py-4 text-sm leading-relaxed"
      style={{
        color: "var(--dashboard-text)",
        backgroundColor: "var(--dashboard-surface)",
        borderColor: "var(--dashboard-border)",
      }}
    >
      <span className="font-bold text-amber-400">Key Insight: </span>
      {children}
    </div>
  );
}

function ActHeader({
  number,
  title,
  subtitle,
  quote,
  color,
}: {
  number: number;
  title: string;
  subtitle: string;
  quote: string;
  color: string;
}) {
  return (
    <div className="pt-16 pb-6">
      <div className="mb-4 flex items-center gap-4">
        <Badge className={`${color} border-0 px-3 py-1 font-mono text-xs uppercase tracking-widest text-white`}>
          Act {number}
        </Badge>
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg, var(--dashboard-divider), transparent)" }}
        />
      </div>
      <h2 className="dashboard-text-strong mb-1 text-3xl font-bold tracking-tight">{title}</h2>
      <p className="dashboard-text-soft text-lg">{subtitle}</p>
      <blockquote className="dashboard-text-soft mt-4 max-w-2xl text-sm italic">
        &ldquo;{quote}&rdquo;
      </blockquote>
    </div>
  );
}

export default function Home() {
  const { data, loading, error } = usePenguinData();
  const kmeansValidation = useKMeansValidation();

  if (loading) {
    return (
      <div className="dashboard-text w-full h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
        <h2 className="text-2xl font-light">Loading telemetry...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center text-red-500">
        <h2 className="mb-2 text-2xl font-bold">Failed to sync data</h2>
        <p className="opacity-80">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 md:px-10">
      <section className="pt-10 pb-6">
        <p className="dashboard-text-muted max-w-3xl text-base leading-relaxed">
          Set in the rugged Palmer Archipelago of Antarctica, this dashboard invites you to investigate how three
          distinct penguin tribes, the <strong style={{ color: "#15478A" }}>Adelie</strong>,{" "}
          <strong style={{ color: "#5BB5D5" }}>Chinstrap</strong>, and{" "}
          <strong style={{ color: "#876EC4" }}>Gentoo</strong>, navigate territory, physical evolution, and biological
          competition.
        </p>
      </section>

      <KPICards data={data} />

      <div className="mt-6 mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="dashboard-panel flex items-center justify-center py-6">
          <DistributionDonut data={data} variable="species" title="Species Distribution" />
        </Card>
        <Card className="dashboard-panel flex items-center justify-center py-6">
          <DistributionDonut data={data} variable="sex" title="Sex Distribution" />
        </Card>
      </div>

      <ActHeader
        number={1}
        title="The Territory"
        subtitle="Geographic Distribution of the Three Tribes"
        quote="Set the stage by exploring where these tribes live. While the Adelies are hardy pioneers found on every island, the Gentoos and Chinstraps are more exclusive to their specific territories."
        color="bg-[#15478A]"
      />

      <NarrativeBox>
        <strong>The Territory:</strong> Before we understand these penguin tribes, we must first understand their land.
        The Palmer Archipelago consists of three islands, <strong>Biscoe</strong>, <strong>Dream</strong>, and{" "}
        <strong>Torgersen</strong>. Where a species (<strong style={{ color: "#15478A" }}>Adelie</strong>,{" "}
        <strong style={{ color: "#5BB5D5" }}>Chinstrap</strong>, or{" "}
        <strong style={{ color: "#876EC4" }}>Gentoo</strong>) chooses to live tells us much about its survival
        strategy.
      </NarrativeBox>

      <Card className="dashboard-panel flex items-center justify-center py-6">
        <IslandDistribution data={data} />
      </Card>

      <InsightBox>
        Adelie is the only species situated across all three islands, true ecological pioneers. Gentoo strictly
        resides on Biscoe, while Chinstraps are exclusive to Dream. The data also perfectly demonstrates the even
        50/50 gender survival ratio per colony.
      </InsightBox>

      <ActHeader
        number={2}
        title="The Physical Paradox"
        subtitle="Simpson's Paradox in Morphology"
        quote="Appearances can be deceiving. This act reveals a hidden truth: while the overall data might suggest one trend, looking at individual tribes reveals the true biological relationships."
        color="bg-amber-600"
      />

      <NarrativeBox>
        <strong>Step 1, the starting point:</strong> Before applying any machine learning algorithm, a data scientist&apos;s
        first instinct is to examine the <strong>correlation matrix</strong>. This heatmap reveals how each physical
        measurement relates to the others across the entire population. Take a close look at the <strong>Bill
        Depth</strong> row.
      </NarrativeBox>

      <Card className="dashboard-panel flex items-center justify-center py-6">
        <CorrelationHeatmap data={data} title="Overall Population Correlation" />
      </Card>

      <InsightBox>
        Something does not add up. Bill Depth shows <strong>negative correlations</strong> with Bill Length (-0.23),
        Flipper Length (-0.58), and Body Mass (-0.47). But common sense tells us bigger penguins should have deeper
        bills. <strong>Why does the data contradict biology?</strong>
      </InsightBox>

      <NarrativeBox>
        <strong>Step 2, uncovering the truth:</strong> What if the aggregation is hiding something? We have not
        accounted for <strong>species differences</strong>. Let&apos;s compute the same correlation matrix, but this
        time within each tribe separately.
      </NarrativeBox>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="dashboard-panel flex items-center justify-center px-2 py-4">
          <CorrelationHeatmap data={data} filterSpecies="Adelie" title="Adelie" compact />
        </Card>
        <Card className="dashboard-panel flex items-center justify-center px-2 py-4">
          <CorrelationHeatmap data={data} filterSpecies="Chinstrap" title="Chinstrap" compact />
        </Card>
        <Card className="dashboard-panel flex items-center justify-center px-2 py-4">
          <CorrelationHeatmap data={data} filterSpecies="Gentoo" title="Gentoo" compact />
        </Card>
      </div>

      <InsightBox>
        The paradox is resolved. Within each species, Bill Depth is <strong>positively correlated</strong> with all
        other features, exactly as biology predicts. The negative overall correlation was a statistical illusion caused
        by mixing three distinct populations. This is a textbook case of <strong>Simpson&apos;s Paradox</strong>.
      </InsightBox>

      <NarrativeBox>
        <strong>Step 3, visual confirmation:</strong> Let&apos;s see this paradox in action with a scatter plot. Start
        with the aggregated view, then click <strong>Reveal the Tribes</strong> to watch the negative trend dissolve
        into three positive ones.
      </NarrativeBox>

      <Card className="dashboard-panel px-4 py-6">
        <SimpsonParadox data={data} />
      </Card>

      <InsightBox>
        When viewed as a single population, bill length and bill depth appear <strong>negatively correlated</strong>{" "}
        (slope about -0.082). But when separated by species, each tribe shows a <strong>positive correlation</strong>.
        The Gentoos, with their uniquely long but shallower bills, shift the overall trend downward.
      </InsightBox>

      <ActHeader
        number={3}
        title="The Engine of the Penguin"
        subtitle="Visualizing Core Scaling and Profiling Athletes"
        quote="Which physical attribute dictates the overall weight of a penguin? We start visually across dimensions, validate the trend with the heatmaps, and then profile each tribe."
        color="bg-emerald-600"
      />

      <NarrativeBox>
        <strong>The discovery phase:</strong> We map Body Mass against the three other core bodily mechanics. Which
        scatter cloud yields the tightest linear fit?
      </NarrativeBox>

      <Card className="dashboard-panel flex items-center justify-center py-6">
        <EngineScatter data={data} />
      </Card>

      <SpeciesShowcase data={data} />

      <InsightBox>
        Because the flipper functions as the engine, biological necessity requires Gentoos to house heavily scaled
        body masses purely to operate their massive limbs underneath Antarctic currents.
      </InsightBox>

      <ActHeader
        number={4}
        title="The Internal Divide"
        subtitle="Sexual Dimorphism Across All Tribes"
        quote="Within every tribe, there is a clear divide. This act explores how male penguins consistently outsize females across every metric, a key factor in their social and survival structures."
        color="bg-purple-600"
      />

      <NarrativeBox>
        <strong>The internal divide:</strong> Nature&apos;s division runs deep. Within each species, males consistently
        outsize females, a phenomenon called <em>sexual dimorphism</em>. But does this gap remain constant across all
        physical traits, or do some features show a bigger divide than others?
      </NarrativeBox>

      <Card className="dashboard-panel mx-auto flex w-full max-w-4xl flex-col justify-center py-4">
        <DumbbellPlot data={data} />
      </Card>

      <InsightBox>
        <strong>Beware the average:</strong> Simple averages are vulnerable to outline bias. Knowing males are +18%
        heavier on average does not tell us if all males are heavier than all females. By separating the distributions
        into <strong>box plots</strong> beneath the mean comparisons, we reveal the true variance, median clusters, and
        the profound physical overlap in their biology.
      </InsightBox>

      <Card className="dashboard-panel mx-auto flex w-full max-w-5xl flex-col justify-center py-4">
        <DimorphismBoxplot data={data} />
      </Card>

      <ActHeader
        number={5}
        title="The Machine Learning Insight"
        subtitle="Clustering and Dimensionality Reduction"
        quote="Can a computer find the tribes without being told their names? The finale uses unsupervised learning to see if the physical data alone is enough to recreate the species groupings we see in nature."
        color="bg-cyan-600"
      />

      <NarrativeBox>
        <strong>The machine&apos;s eye:</strong> We utilize unsupervised machine learning algorithms to deduce species
        mathematically. We specifically execute PCA against four isolated features: <em>Bill Length</em>,{" "}
        <em>Bill Depth</em>, <em>Flipper Length</em>, and <em>Body Mass</em>. By dropping categorical data (Islands,
        Sex), we force the model to find underlying biological structure rather than relying on geography.
      </NarrativeBox>

      <PCAScatter data={data} />

      <InsightBox>
        Adding a 3rd principal component validates depth, but the pure 2D split already successfully isolates the
        exact partitions we identified manually. PC1 independently controls about 68.8% of variance, heavily anchored
        by generalized Body Mass.
      </InsightBox>

      <NarrativeBox>
        <strong>K-Means clustering:</strong> Now we put the machine to the test. K-Means groups data into <em>k</em>{" "}
        clusters purely by proximity in feature space. Can it rediscover the three species without ever seeing the
        labels?
      </NarrativeBox>

      <KMeansComparison data={data} />

      <NarrativeBox>
        <strong>Triangulating the optimal k:</strong> How do we know k=3 is the right choice? Two validation
        techniques confirm it. The <strong>Elbow Method</strong> looks for diminishing returns in inertia, while the{" "}
        <strong>Silhouette Score</strong> measures cluster compactness.
      </NarrativeBox>

      {kmeansValidation && <ClusterValidation validation={kmeansValidation} />}

      <InsightBox>
        While the Elbow Method naturally confirms <strong>3 clusters</strong> as optimal, the Silhouette Score peaks at
        k=2. This occurs because Chinstrap and Adelie bodily structures are highly homologous, tricking silhouette
        isolation. But nature&apos;s 3 wins out, and K-Means still achieves <strong>about 80% agreement</strong> (ARI
        = 0.80) with the actual species labels.
      </InsightBox>

      <div className="pt-16 pb-8">
        <div className="mb-6 flex items-center gap-4">
          <Badge
            className="border-0 px-3 py-1 font-mono text-xs uppercase tracking-widest"
            style={{
              backgroundColor: "var(--dashboard-surface)",
              color: "var(--dashboard-text-muted)",
            }}
          >
            Epilogue
          </Badge>
          <div
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, var(--dashboard-divider), transparent)" }}
          />
        </div>
        <h2 className="dashboard-text-strong mb-2 text-3xl font-bold tracking-tight">What the Data Tells Us</h2>
        <p className="dashboard-text-soft mb-8 max-w-2xl">
          The story of the Palmer Archipelago penguins is ultimately one of{" "}
          <strong className="dashboard-text-strong">adaptation, specialization, and nature&apos;s elegant engineering.</strong>
        </p>

        <div className="overflow-x-auto rounded-3xl border dashboard-panel">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--dashboard-surface)" }} className="dashboard-text-strong">
                <th className="px-5 py-3 font-semibold">Act</th>
                <th className="px-5 py-3 font-semibold">Discovery</th>
                <th className="px-5 py-3 font-semibold">Key Takeaway</th>
              </tr>
            </thead>
            <tbody className="dashboard-text-muted">
              <tr className="border-t dashboard-divider">
                <td className="dashboard-text-strong px-5 py-3 font-bold">1. The Territory</td>
                <td className="px-5 py-3">Geographic isolation</td>
                <td className="px-5 py-3">Adelies are pioneers, while Gentoos and Chinstraps are specialists</td>
              </tr>
              <tr className="border-t dashboard-divider">
                <td className="dashboard-text-strong px-5 py-3 font-bold">2. The Paradox</td>
                <td className="px-5 py-3">Simpson&apos;s Paradox</td>
                <td className="px-5 py-3">Aggregated data can mislead, so always inspect subgroup structure</td>
              </tr>
              <tr className="border-t dashboard-divider">
                <td className="dashboard-text-strong px-5 py-3 font-bold">3. The Engine</td>
                <td className="px-5 py-3">Flipper-mass correlation</td>
                <td className="px-5 py-3">Form follows function, with flipper scale tightly linked to mass</td>
              </tr>
              <tr className="border-t dashboard-divider">
                <td className="dashboard-text-strong px-5 py-3 font-bold">4. The Divide</td>
                <td className="px-5 py-3">Sexual dimorphism</td>
                <td className="px-5 py-3">Male and female bodies overlap, but males still trend larger across metrics</td>
              </tr>
              <tr className="border-t dashboard-divider">
                <td className="dashboard-text-strong px-5 py-3 font-bold">5. The Machine</td>
                <td className="px-5 py-3">Unsupervised clustering</td>
                <td className="px-5 py-3">Algorithms can rediscover nature&apos;s groupings from measurements alone</td>
              </tr>
            </tbody>
          </table>
        </div>

        <blockquote className="dashboard-text-soft mt-8 max-w-2xl border-l-2 pl-4 text-sm italic dashboard-divider">
          &ldquo;The data tells a story of three tribes, shaped by millions of years of evolution, each perfectly
          adapted to its niche in one of Earth&apos;s harshest environments.&rdquo;
        </blockquote>

        <p className="dashboard-text-faint mt-8 text-xs">
          Source: Palmer Penguins Dataset (Horst, Hill and Gorman, 2020) | Built with Next.js, D3.js, and Tailwind CSS
          for COMP4010, VinUniversity (Spring 2026)
        </p>
      </div>
    </div>
  );
}
