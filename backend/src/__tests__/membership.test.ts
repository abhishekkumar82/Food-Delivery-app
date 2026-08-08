import { getPlan, MEMBERSHIP_PLANS } from "../config/membership-plans";

describe("membership plans", () => {
  it("exposes exactly the gold and pro plans", () => {
    expect(MEMBERSHIP_PLANS.map((p) => p.id).sort()).toEqual(["gold", "pro"]);
  });

  it("looks up a plan by id", () => {
    expect(getPlan("gold")?.freeDelivery).toBe(true);
    expect(getPlan("pro")?.discountPercent).toBe(15);
  });

  it("returns undefined for an unknown plan", () => {
    expect(getPlan("bogus")).toBeUndefined();
  });
});
