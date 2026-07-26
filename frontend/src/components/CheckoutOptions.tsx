import { useValidateCoupon } from "@/api/CouponApi";
import { useGetWallet } from "@/api/WalletApi";
import { AppliedCoupon } from "@/types";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Leaf, Tag, Wallet, X } from "lucide-react";

export type CheckoutSelections = {
  paymentMethod: "card" | "cod" | "upi";
  couponCode?: string;
  discountAmount: number;
  walletApplied: number;
  scheduledFor?: string;
  ecoPackaging?: boolean;
};

type Props = {
  subtotal: number; // minor units (items only, no delivery)
  restaurantId: string;
  onChange: (selections: CheckoutSelections) => void;
};

const CheckoutOptions = ({ subtotal, restaurantId, onChange }: Props) => {
  const { wallet } = useGetWallet();
  const { validateCoupon, isLoading: isValidating } = useValidateCoupon();

  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutSelections["paymentMethod"]>("card");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [ecoPackaging, setEcoPackaging] = useState(false);

  const walletBalance = wallet?.balance ?? 0;
  const discountAmount = applied?.discountAmount ?? 0;
  const walletApplied = useWallet
    ? Math.min(walletBalance, Math.max(0, subtotal - discountAmount))
    : 0;

  useEffect(() => {
    onChange({
      paymentMethod,
      couponCode: applied?.code,
      discountAmount,
      walletApplied,
      scheduledFor: scheduleEnabled && scheduledFor ? scheduledFor : undefined,
      ecoPackaging,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paymentMethod,
    applied,
    discountAmount,
    walletApplied,
    scheduleEnabled,
    scheduledFor,
    ecoPackaging,
  ]);

  const handleApply = async () => {
    if (!codeInput.trim()) return;
    try {
      const result = await validateCoupon({
        code: codeInput.trim(),
        subtotal,
        restaurantId,
      });
      setApplied(result);
      toast.success(`Coupon ${result.code} applied`);
    } catch (e: any) {
      toast.error(e.message || "Invalid coupon");
    }
  };

  const radio = (value: CheckoutSelections["paymentMethod"], label: string) => (
    <label
      className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border py-2 text-sm ${
        paymentMethod === value
          ? "border-orange-500 bg-orange-50 font-semibold text-orange-600"
          : "border-gray-200"
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={paymentMethod === value}
        onChange={() => setPaymentMethod(value)}
        className="hidden"
      />
      {label}
    </label>
  );

  return (
    <div className="flex flex-col gap-4 px-6 pb-2">
      {/* Coupon */}
      <div>
        <span className="mb-1 flex items-center gap-1 text-sm font-semibold">
          <Tag size={14} /> Promo code
        </span>
        {applied ? (
          <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            <span>
              {applied.code} — {(applied.discountAmount / 100).toFixed(2)} off
            </span>
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => {
                setApplied(null);
                setCodeInput("");
              }}
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="WELCOME50"
              className="bg-white"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isValidating}
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Wallet */}
      {walletBalance > 0 && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useWallet}
            onChange={(e) => setUseWallet(e.target.checked)}
          />
          <Wallet size={14} />
          Use wallet balance (£{(walletBalance / 100).toFixed(2)} available)
        </label>
      )}

      {/* Payment method */}
      <div>
        <span className="mb-1 block text-sm font-semibold">Payment method</span>
        <div className="flex gap-2">
          {radio("card", "💳 Card")}
          {radio("cod", "💵 Cash")}
          {radio("upi", "📱 UPI")}
        </div>
      </div>

      {/* Eco-friendly packaging */}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={ecoPackaging}
          onChange={(e) => setEcoPackaging(e.target.checked)}
        />
        <Leaf size={14} className="text-green-600" />
        Use eco-friendly packaging 🌱
      </label>

      {/* Schedule */}
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
          />
          Schedule for later
        </label>
        {scheduleEnabled && (
          <Input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="mt-2 bg-white"
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutOptions;
