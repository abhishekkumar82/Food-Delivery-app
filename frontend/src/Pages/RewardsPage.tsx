import { useGetGamification } from "@/api/GamificationApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";

const RewardsPage = () => {
  const { data, isLoading } = useGetGamification();

  if (isLoading) return <span>Loading rewards...</span>;
  if (!data) return <span className="text-gray-500">Could not load rewards.</span>;

  const { level, xpIntoLevel, xpForNextLevel, currentStreak, longestStreak, badges, earnedCount } =
    data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Trophy className="text-amber-500" />
        <h1 className="text-2xl font-bold">Rewards & Achievements</h1>
      </div>

      {/* level + streak */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Level</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <span className="text-3xl font-bold">Lvl {level}</span>
            <div className="h-2 w-full rounded bg-gray-100">
              <div
                className="h-2 rounded bg-orange-500"
                style={{ width: `${(xpIntoLevel / xpForNextLevel) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {xpIntoLevel}/{xpForNextLevel} XP to level {level + 1}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1 text-sm text-gray-500">
              <Flame size={16} className="text-orange-500" /> Current streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{currentStreak} 🔥</span>
            <p className="text-xs text-gray-400">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Best streak</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{longestStreak}</span>
            <p className="text-xs text-gray-400">days</p>
          </CardContent>
        </Card>
      </div>

      {/* badges */}
      <div>
        <h2 className="mb-3 text-lg font-bold">
          Badges{" "}
          <span className="text-sm font-normal text-gray-500">
            ({earnedCount}/{badges.length} earned)
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={
                badge.earned
                  ? "border-amber-300 bg-amber-50"
                  : "opacity-70 grayscale"
              }
            >
              <CardContent className="flex flex-col items-center gap-1 py-5 text-center">
                <span className="text-4xl">{badge.icon}</span>
                <span className="font-bold">{badge.name}</span>
                <span className="text-xs text-gray-500">{badge.description}</span>
                {badge.earned ? (
                  <span className="mt-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Earned
                  </span>
                ) : (
                  <div className="mt-1 w-full">
                    <div className="h-1.5 w-full rounded bg-gray-200">
                      <div
                        className="h-1.5 rounded bg-orange-400"
                        style={{ width: `${(badge.progress / badge.goal) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {badge.progress}/{badge.goal}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
