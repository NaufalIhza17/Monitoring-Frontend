import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import type { Attendance } from "@/types/attendance.types";
import { Button } from "@/components/ui/button";
import WorkTimer from "./WorkTimer";
import BreakTimer from "./BreakTimer";
import PhotoUploadModal from "./PhotoUploadModal";
import { Coffee, LogIn, LogOut } from "lucide-react";

export default function ClockInOut() {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    try {
      const res = await api.get("/attendance/today/me");
      setAttendance(res.data);
    } catch {
      setAttendance(null);
    }

    // always sync user from server
    try {
      const meRes = await api.get("/auth/me");
      if (token) setAuth(meRes.data, token);
    } catch {}
  };

  useEffect(() => {
    fetchToday();
  }, []);

  // poll every 10s to catch HRD approval changes
  useEffect(() => {
    const interval = setInterval(fetchToday, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async (photoUrl: string) => {
    setLoading(true);
    try {
      await api.post("/attendance/clock-in", { photoUrl });
      await fetchToday();
      // update user work status in store
      if (user && token) {
        setAuth(
          { ...user, workStatus: user.role === "hrd" ? "working" : "pending" },
          token,
        );
      }
      setPhotoOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await api.patch("/attendance/clock-out");
      await fetchToday();
      if (user && token) setAuth({ ...user, workStatus: "off duty" }, token);
    } finally {
      setLoading(false);
    }
  };

  const handleBreak = async () => {
    setLoading(true);
    try {
      if (attendance?.isOnBreak) {
        await api.patch("/attendance/end-break");
        if (user && token) setAuth({ ...user, workStatus: "working" }, token);
      } else {
        await api.patch("/attendance/start-break");
        if (user && token) setAuth({ ...user, workStatus: "on break" }, token);
      }
      await fetchToday();
    } finally {
      setLoading(false);
    }
  };

  const workStatus = user?.workStatus;
  const isClockedIn =
    workStatus === "working" ||
    workStatus === "on break" ||
    workStatus === "pending";
  const isPending = workStatus === "pending";
  const isOffDuty = workStatus === "off duty";
  const breakLimitReached = (attendance?.totalBreakMinutes ?? 0) >= 60;
  const isPhotoRevision = workStatus === "photo revision";
  const isClockedOut = !!attendance?.clockOutTime;
  const isInvalid = !!attendance?.isInvalid;
  const canClockIn =
    (isOffDuty || isPhotoRevision) && !isClockedOut && !isInvalid;

  return (
    <div className="flex flex-col items-center gap-8 mx-auto h-full justify-center">
      <div className="flex flex-col gap-8 w-full">
        {/* Proof Image Name + User can change it if havent been approved */}
        {attendance?.photoUrl && !isPhotoRevision && (
          <div className="text-sm text-[#C89F53] text-center bg-[#C89F53]/10 px-4 py-2 rounded-lg w-full border border-dashed border-[#C89F53]">
            Proof Image: {attendance.photoUrl.split("/").pop()}
          </div>
        )}

        {/* Timer */}
        {attendance?.clockInTime &&
        !attendance.clockOutTime &&
        !attendance.isInvalid ? (
          <WorkTimer
            clockInTime={attendance.clockInTime}
            isActive={true}
            onExpire={fetchToday}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Time Remaining</p>
            <p className="text-6xl font-mono font-bold tabular-nums tracking-tight text-muted-foreground">
              08:00:00
            </p>
          </div>
        )}

        {/* Pending notice */}
        {isPending && (
          <p className="text-sm text-blue-400 text-center bg-blue-500/10 px-4 py-2 rounded-lg w-full">
            Waiting for HRD approval...
          </p>
        )}

        {/* Photo revision notice */}
        {isPhotoRevision && (
          <Button
            onClick={() => setPhotoOpen(true)}
            className="text-sm text-white text-center bg-white/10 px-4 py-2 rounded-lg w-full border border-dashed border-white hover:bg-white/40"
          >
            Your proof photo needs revision. Please upload a new photo by
            clicking this button.
          </Button>
        )}
      </div>

      {/* Break Timer */}
      {isClockedIn && attendance && (
        <BreakTimer
          totalBreakMinutes={attendance.totalBreakMinutes}
          isOnBreak={attendance.isOnBreak}
          breakStartTime={attendance.breakStartTime}
        />
      )}

      <div className="grid gap-2 w-full grid-cols-3 justify-center">
        {/* Clock In / Out Button */}
        <Button
          className="bg-[#9BC853]/20 hover:bg-[#9BC853] border-2 border-[#9BC853] uppercase text-base py-5 px-8 rounded-[32px] overflow-clip"
          size="lg"
          onClick={() => setPhotoOpen(true)}
          disabled={loading || !canClockIn || isPending}
        >
          <LogIn size={18} />
          Clock In
        </Button>

        {/* Break Button */}
        <Button
          className={`${attendance?.isOnBreak ? "bg-[#6553C8]/20 hover:bg-[#6553C8] border-[#6553C8]" : "bg-[#C89F53]/20 hover:bg-[#C89F53] border-[#C89F53]"} border-2 uppercase text-base py-5 px-8 rounded-[32px] overflow-clip`}
          size="lg"
          disabled={
            loading ||
            breakLimitReached ||
            isPending ||
            isOffDuty ||
            isClockedOut
          }
          onClick={handleBreak}
        >
          <Coffee size={18} />
          {attendance?.isOnBreak
            ? "End Break"
            : breakLimitReached
              ? "Break Limit Reached"
              : "Start Break"}
        </Button>

        {/* Clock Out Button */}
        <Button
          className="bg-[#C85353]/20 hover:bg-[#C85353] border-2 border-[#C85353] uppercase text-base py-5 px-8 rounded-[32px] overflow-clip"
          size="lg"
          disabled={
            loading ||
            attendance?.isOnBreak ||
            isPending ||
            isOffDuty ||
            isClockedOut
          }
          onClick={handleClockOut}
        >
          <LogOut size={18} />
          Clock Out
        </Button>
      </div>

      {/* Clocked out summary */}
      {attendance?.clockOutTime && (
        <div className="text-center space-y-1 text-white border border-white/20 bg-white/10 rounded-lg px-4 py-2 w-full">
          <p className="text-sm text-muted-foreground">
            Already clocked out today
          </p>
          <p className="text-sm text-muted-foreground">Today's Summary</p>
          <p className="text-sm">
            Total:{" "}
            <span className="font-medium">
              {Math.floor(attendance.totalWorkingMinutes / 60)}h{" "}
              {attendance.totalWorkingMinutes % 60}m
            </span>
          </p>
          <p className="text-sm">
            Break:{" "}
            <span className="font-medium">{attendance.totalBreakMinutes}m</span>
          </p>
        </div>
      )}

      {attendance?.isInvalid && (
        <div className="text-center border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-2 w-full">
          <p className="text-sm text-red-400 font-medium">
            Work not valid today
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {attendance.invalidReason}
          </p>
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSuccess={handleClockIn}
      />
    </div>
  );
}
