import {
  useCancelMembership,
  useGetMembership,
  useSubscribeMembership,
} from "@/api/MembershipApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown } from "lucide-react";

const money = (minor: number) => `£${(minor / 100).toFixed(2)}`;

const MembershipPage = () => {
  const { data, isLoading } = useGetMembership();
  const { subscribe, isLoading: isSubscribing } = useSubscribeMembership();
  const { cancel, isLoading: isCancelling } = useCancelMembership();

  if (isLoading) return <span>Loading membership...</span>;
  if (!data) return <span className="text-gray-500">Could not load membership.</span>;

  const { membership, walletBalance, plans } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Crown className="text-amber-500" />
        <h1 className="text-2xl font-bold">Membership</h1>
      </div>

      {/* current status */}
      {membership.active ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex flex-col gap-2 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-bold capitalize">
                {membership.plan} member 🎉
              </p>
              <p className="text-sm text-gray-600">
                Active until{" "}
                {membership.expiresAt
                  ? new Date(membership.expiresAt).toDateString()
                  : "—"}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => cancel()}
            >
              Cancel membership
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-600">
          You're not a member yet. Subscribe to unlock free delivery and member
          discounts on every order.
        </p>
      )}

      <p className="text-sm text-gray-500">
        Wallet balance: <span className="font-semibold">{money(walletBalance)}</span>{" "}
        — plans are paid from your wallet when you have funds (otherwise activated
        in demo mode).
      </p>

      {/* plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = membership.active && membership.plan === plan.id;
          return (
            <Card
              key={plan.id}
              className={isCurrent ? "border-2 border-amber-400" : ""}
            >
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span className="text-xl">{plan.name}</span>
                  <span className="text-2xl font-bold">
                    {money(plan.price)}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / {plan.durationDays} days
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="flex flex-col gap-2">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-600" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={isSubscribing || isCurrent}
                  onClick={() => subscribe(plan.id)}
                >
                  {isCurrent ? "Current plan" : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipPage;
