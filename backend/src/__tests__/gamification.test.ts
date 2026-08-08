import { computeStreaks } from "../controllers/GamificationController";

// helper: a YYYY-MM-DD key `offset` days before today
const dayKey = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

describe("computeStreaks", () => {
  it("returns zero for no orders", () => {
    expect(computeStreaks([])).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it("finds the longest consecutive run", () => {
    const { longestStreak } = computeStreaks([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
      "2024-01-10",
    ]);
    expect(longestStreak).toBe(3);
  });

  it("counts a current streak ending today", () => {
    const { currentStreak } = computeStreaks([dayKey(0), dayKey(1), dayKey(2)]);
    expect(currentStreak).toBe(3);
  });

  it("ignores duplicate days", () => {
    const { longestStreak } = computeStreaks([
      "2024-01-01",
      "2024-01-01",
      "2024-01-02",
    ]);
    expect(longestStreak).toBe(2);
  });
});
