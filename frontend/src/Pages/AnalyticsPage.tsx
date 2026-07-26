import { useGetRestaurantAnalytics } from "@/api/AnalyticsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Receipt, TrendingUp } from "lucide-react";

const money = (minor: number) => `£${(minor / 100).toFixed(2)}`;

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-gray-400",
  paid: "bg-blue-500",
  confirmed: "bg-indigo-500",
  inProgress: "bg-yellow-500",
  readyForPickup: "bg-purple-500",
  outForDelivery: "bg-orange-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const AnalyticsPage = () => {
  const { analytics, isLoading } = useGetRestaurantAnalytics();

  if (isLoading) return <span>Loading analytics...</span>;
  if (!analytics) {
    return (
      <span className="text-gray-500">
        No analytics yet — you need a restaurant with orders.
      </span>
    );
  }

  const { totalRevenue, totalOrders, avgOrderValue, statusBreakdown, topItems, last7Days } =
    analytics;

  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);
  const maxItemQty = Math.max(...topItems.map((i) => i.quantity), 1);
  const totalStatusCount =
    Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Restaurant Analytics</h1>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp size={16} /> Total revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{money(totalRevenue)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <Receipt size={16} /> Total orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalOrders}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 size={16} /> Avg order value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{money(avgOrderValue)}</span>
          </CardContent>
        </Card>
      </div>

      {/* Revenue last 7 days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue — last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-52 items-end gap-3">
            {last7Days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-600">
                  {d.revenue > 0 ? money(d.revenue) : ""}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-orange-500 transition-all"
                    style={{
                      height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%`,
                    }}
                    title={`${d.orders} orders`}
                  />
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(d.date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top selling items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topItems.length === 0 ? (
              <span className="text-sm text-gray-500">No sales yet.</span>
            ) : (
              topItems.map((item) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">{item.quantity} sold</span>
                  </div>
                  <div className="h-2 w-full rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-green-500"
                      style={{ width: `${(item.quantity / maxItemQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {Object.entries(statusBreakdown).length === 0 ? (
              <span className="text-sm text-gray-500">No orders yet.</span>
            ) : (
              Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3 text-sm">
                  <span className="w-28 capitalize text-gray-600">{status}</span>
                  <div className="h-4 flex-1 rounded bg-gray-100">
                    <div
                      className={`h-4 rounded ${STATUS_COLORS[status] || "bg-gray-400"}`}
                      style={{ width: `${(count / totalStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-semibold">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
