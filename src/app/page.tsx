import { Dashboard } from "@/components/Dashboard";
import { getListings, getInsights, getSourceStatus } from "@/lib/data";

export default function Home() {
  const listings = getListings();
  const insights = getInsights();
  return (
    <Dashboard
      listings={listings}
      insights={insights}
      model={insights.model}
      sourceStatus={getSourceStatus()}
    />
  );
}
