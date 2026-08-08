import { computeDiscount } from "../controllers/CouponController";

describe("computeDiscount", () => {
  it("applies a percentage discount", () => {
    expect(computeDiscount({ discountType: "percent", value: 20 }, 1000)).toBe(200);
  });

  it("caps a percentage discount at maxDiscount", () => {
    expect(
      computeDiscount({ discountType: "percent", value: 50, maxDiscount: 300 }, 1000)
    ).toBe(300);
  });

  it("applies a flat discount", () => {
    expect(computeDiscount({ discountType: "flat", value: 500 }, 1000)).toBe(500);
  });

  it("never discounts more than the subtotal", () => {
    expect(computeDiscount({ discountType: "flat", value: 5000 }, 1000)).toBe(1000);
  });
});
