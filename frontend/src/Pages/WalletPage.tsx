import { useGetWallet, useRedeemLoyalty } from "@/api/WalletApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Coins, Wallet } from "lucide-react";
import { useState } from "react";

const WalletPage = () => {
  const { wallet, isLoading } = useGetWallet();
  const { redeemLoyalty, isLoading: isRedeeming } = useRedeemLoyalty();
  const [points, setPoints] = useState("");

  if (isLoading) {
    return <span>Loading wallet...</span>;
  }

  const balance = wallet?.balance ?? 0;
  const loyaltyPoints = wallet?.loyaltyPoints ?? 0;
  const transactions = wallet?.transactions ?? [];

  const handleRedeem = async () => {
    const n = parseInt(points);
    if (!n || n <= 0) return;
    await redeemLoyalty(n);
    setPoints("");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Wallet & Rewards</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="text-orange-500" /> Wallet balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">
              £{(balance / 100).toFixed(2)}
            </span>
            <p className="text-sm text-gray-500">
              Applied automatically at checkout when you choose to use it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="text-amber-500" /> Loyalty points
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <span className="text-3xl font-bold">{loyaltyPoints} pts</span>
            <p className="text-sm text-gray-500">
              Earn 5% back on every delivered order. 1 point = 1p — redeem to your
              wallet.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Points to redeem"
                className="h-10 flex-1 rounded-md border px-2 text-sm"
              />
              <Button
                className="bg-orange-500"
                disabled={isRedeeming}
                onClick={handleRedeem}
              >
                Redeem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {transactions.length === 0 ? (
            <span className="text-sm text-gray-500">No transactions yet.</span>
          ) : (
            transactions.map((t, i) => (
              <div key={t._id ?? i}>
                <div className="flex items-center justify-between py-1 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{t.reason || t.type}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={
                      t.type === "credit" ? "text-green-600" : "text-red-500"
                    }
                  >
                    {t.type === "credit" ? "+" : "-"}£{(t.amount / 100).toFixed(2)}
                  </span>
                </div>
                {i < transactions.length - 1 && <Separator />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
