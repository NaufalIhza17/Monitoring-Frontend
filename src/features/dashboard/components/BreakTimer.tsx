import { useEffect, useState } from "react";

type Props = {
  totalBreakMinutes: number;
  isOnBreak: boolean;
  breakStartTime: string | null;
};

const MAX_BREAK = 60 * 60; // 1 hour in seconds

export default function BreakTimer({
  totalBreakMinutes,
  isOnBreak,
  breakStartTime,
}: Props) {
  const [currentBreakSeconds, setCurrentBreakSeconds] = useState(0);

  useEffect(() => {
    if (!isOnBreak || !breakStartTime) {
      setCurrentBreakSeconds(0);
      return;
    }
    const calc = () => {
      const diff = Math.floor(
        (Date.now() - new Date(breakStartTime).getTime()) / 1000,
      );
      setCurrentBreakSeconds(diff);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [isOnBreak, breakStartTime]);

  const usedSeconds = totalBreakMinutes * 60 + currentBreakSeconds;
  const remaining = Math.max(MAX_BREAK - usedSeconds, 0);
  const pct = Math.min((usedSeconds / MAX_BREAK) * 100, 100);

  const fmt = (n: number) => String(n).padStart(2, "0");
  const remMins = Math.floor(remaining / 60);
  const remSecs = remaining % 60;

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Break used: {totalBreakMinutes + Math.floor(currentBreakSeconds / 60)}
          m
        </span>
        <span>
          Remaining: {fmt(remMins)}:{fmt(remSecs)}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-red-500" : "bg-yellow-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
