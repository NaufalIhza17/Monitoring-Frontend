import { useEffect, useState, useRef } from "react";

type Props = {
  clockInTime: string;
  isActive: boolean;
  onExpire?: () => void;
};

const WORK_SECONDS = 8 * 60 * 60; // 8 hours

export default function WorkTimer({ clockInTime, isActive, onExpire }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;
    const calc = () => {
      const diff = Math.floor(
        (Date.now() - new Date(clockInTime).getTime()) / 1000,
      );
      setElapsed(diff);

      if (diff >= WORK_SECONDS && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [clockInTime, isActive, onExpire]);

  const remaining = Math.max(WORK_SECONDS - elapsed, 0);
  const isOvertime = elapsed > WORK_SECONDS;

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const overtimeSeconds = elapsed - WORK_SECONDS;
  const otHours = Math.floor(overtimeSeconds / 3600);
  const otMinutes = Math.floor((overtimeSeconds % 3600) / 60);
  const otSeconds = overtimeSeconds % 60;

  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">
        {isOvertime ? "Overtime" : "Time Remaining"}
      </p>
      <p
        className={`text-6xl font-mono font-bold tabular-nums tracking-tight
        ${isOvertime ? "text-orange-400" : "text-white"}`}
      >
        {isOvertime
          ? `+${fmt(otHours)}:${fmt(otMinutes)}:${fmt(otSeconds)}`
          : `${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`}
      </p>
      {isOvertime && (
        <p className="text-xs text-orange-400/70">You have passed 8 hours</p>
      )}
    </div>
  );
}
