import { useGetSustainability } from "@/api/SustainabilityApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const SustainabilityPage = () => {
  const { data, isLoading } = useGetSustainability();

  if (isLoading) return <span>Loading your impact...</span>;
  if (!data) return <span className="text-gray-500">Could not load impact.</span>;

  const stat = (label: string, value: string, sub?: string) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-bold">{value}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Leaf className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">My Green Impact</h1>
          <p className="text-sm text-gray-500">
            Every eco choice and rescued meal adds up. 🌍
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stat("Meals rescued", `${data.mealsRescued} 🎁`, "surprise bags claimed")}
        {stat("Eco-packaging orders", `${data.ecoOrders}`, `of ${data.totalOrders} orders`)}
        {stat("CO₂ saved", `${data.carbonSavedKg} kg`, "vs standard packaging")}
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">
            That's equivalent to…
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-green-900 md:flex-row md:gap-10">
          <div>
            <span className="text-2xl font-bold">🌳 {data.treesEquivalent}</span>
            <p className="text-sm">trees working for a year</p>
          </div>
          <div>
            <span className="text-2xl font-bold">🚗 {data.kmNotDriven} km</span>
            <p className="text-sm">of driving avoided</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">
        Total footprint of your orders so far:{" "}
        <span className="font-semibold">{data.totalCarbonKg} kg CO₂</span>. Choose
        eco-friendly packaging at checkout and rescue surprise bags to keep this
        number low.
      </p>
    </div>
  );
};

export default SustainabilityPage;
