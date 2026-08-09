import {
  AdminCoupon,
  useAdminCoupons,
  useAdminOrders,
  useAdminRestaurants,
  useAdminStats,
  useAdminUsers,
  useCreateCoupon,
  useDeleteCoupon,
  useDeleteRestaurant,
  useUpdateUserRole,
} from "@/api/AdminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

const money = (minor: number) => `£${((minor || 0) / 100).toFixed(2)}`;

const AdminPage = () => {
  const { stats } = useAdminStats();
  const { users } = useAdminUsers();
  const { updateRole } = useUpdateUserRole();
  const { restaurants } = useAdminRestaurants();
  const { deleteRestaurant } = useDeleteRestaurant();
  const { orders } = useAdminOrders();
  const { coupons } = useAdminCoupons();
  const { createCoupon, isLoading: isCreatingCoupon } = useCreateCoupon();
  const { deleteCoupon } = useDeleteCoupon();

  const PAGE = 8;
  const [uPage, setUPage] = useState(1);
  const [rPage, setRPage] = useState(1);
  const [oPage, setOPage] = useState(1);
  const pager = (page: number, setPage: (n: number) => void, total: number) => {
    const pages = Math.max(1, Math.ceil(total / PAGE));
    if (pages <= 1) return null;
    return (
      <div className="mt-2 flex items-center justify-end gap-2 text-sm">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-2 py-0.5 disabled:opacity-40">Prev</button>
        <span>{page}/{pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded border px-2 py-0.5 disabled:opacity-40">Next</button>
      </div>
    );
  };

  const [couponForm, setCouponForm] = useState<Partial<AdminCoupon>>({
    code: "",
    description: "",
    discountType: "percent",
    value: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
  });

  const stat = (label: string, value: string | number) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-orange-500" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stat("Users", stats?.users ?? "—")}
        {stat("Restaurants", stats?.restaurants ?? "—")}
        {stat("Orders", stats?.orders ?? "—")}
        {stat("Revenue", stats ? money(stats.totalRevenue) : "—")}
      </div>

      {/* users */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Users &amp; roles</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users?.slice((uPage - 1) * PAGE, uPage * PAGE).map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateRole({ id: u._id, role: e.target.value as UserRole })
                      }
                      className="rounded border bg-white px-2 py-1"
                    >
                      <option value="customer">customer</option>
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pager(uPage, setUPage, users?.length || 0)}
      </section>

      {/* restaurants */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Restaurants</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {restaurants?.slice((rPage - 1) * PAGE, rPage * PAGE).map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <div>
                <span className="font-semibold">{r.restaurantName}</span>
                <span className="ml-2 text-gray-500">
                  {r.city} · {r.averageRating ?? 0}★ ({r.reviewCount ?? 0})
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => {
                  if (confirm(`Delete ${r.restaurantName}?`)) deleteRestaurant(r._id);
                }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
        {pager(rPage, setRPage, restaurants?.length || 0)}
      </section>

      {/* coupons */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Coupons</h2>
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-4">
          <Input
            className="w-32 bg-white"
            placeholder="CODE"
            value={couponForm.code}
            onChange={(e) =>
              setCouponForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
            }
          />
          <Input
            className="w-56 bg-white"
            placeholder="Description"
            value={couponForm.description}
            onChange={(e) =>
              setCouponForm((p) => ({ ...p, description: e.target.value }))
            }
          />
          <select
            className="h-10 rounded-md border bg-white px-2 text-sm"
            value={couponForm.discountType}
            onChange={(e) =>
              setCouponForm((p) => ({
                ...p,
                discountType: e.target.value as "percent" | "flat",
              }))
            }
          >
            <option value="percent">percent (%)</option>
            <option value="flat">flat (pence)</option>
          </select>
          <Input
            className="w-24 bg-white"
            type="number"
            placeholder="value"
            value={couponForm.value}
            onChange={(e) =>
              setCouponForm((p) => ({ ...p, value: Number(e.target.value) }))
            }
          />
          <Button
            className="bg-orange-500"
            disabled={isCreatingCoupon || !couponForm.code}
            onClick={() => createCoupon(couponForm)}
          >
            Save coupon
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {coupons?.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>
                <span className="font-bold">{c.code}</span> — {c.description}{" "}
                <span className="text-gray-400">
                  ({c.discountType === "percent" ? `${c.value}%` : money(c.value)})
                </span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => deleteCoupon(c._id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* recent orders */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Recent orders</h2>
        <div className="flex flex-col gap-2">
          {orders?.slice((oPage - 1) * PAGE, oPage * PAGE).map((o) => (
            <div
              key={o._id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>
                {o.restaurant && typeof o.restaurant === "object"
                  ? (o.restaurant as any).restaurantName
                  : "(deleted restaurant)"}{" "}
                <span className="text-gray-400">· {o.status}</span>
              </span>
              <span className="font-semibold">{money(o.totalAmount || 0)}</span>
            </div>
          ))}
        </div>
        {pager(oPage, setOPage, orders?.length || 0)}
      </section>
    </div>
  );
};

export default AdminPage;
