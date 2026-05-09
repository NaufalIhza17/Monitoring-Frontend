import ClockInOut from "./components/ClockInOut";
import { useAuthStore } from "@/store/authStore";
import ProfileSection from "./components/ProfileSection";
import AbsenceSection from "./components/AbsenceSection";
import AdminAnalytics from "./components/AdminAnalytics";
import { useEffect, useState } from "react";

import api from "@/lib/axios";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    if (user?.role === "admin") {
      api.get("/attendance/team").then((res) => {
        setTeamData(res.data);
      });
    }
  }, [user]);

  return (
    <div className="p-6 grid grid-flow-col grid-cols-6 gap-10">
      <div className="rounded-[52px] bg-[#3C3C3C] col-span-2 row-span-10 overflow-clip p-10 shadow-lg">
        <h1 className="uppercase font-extralight text-[40px] leading-none">
          <span className="font-bold">Pro</span>file
        </h1>
        {/* Profile Information + Work Status */}
        <ProfileSection />
      </div>
      <div className="col-span-4 col-start-3 row-span-20 rounded-[52px] bg-[#3C3C3C] shadow-lg p-10">
        {user?.role !== "admin" && (
          <h1 className="uppercase font-extralight text-[40px] leading-none">
            <span className="font-bold">Atten</span>dance
          </h1>
        )}
        {user?.role !== "admin" ? (
          <ClockInOut />
        ) : (
          <AdminAnalytics team={teamData} />
        )}
      </div>
      {user?.role !== "admin" && (
        <div className="col-span-2 row-span-10 shadow-lg rounded-[52px] bg-[#3C3C3C] overflow-clip p-10 relative h-full">
          <h1 className="uppercase font-extralight text-[40px] leading-none">
            <span className="font-bold">Abs</span>ence
          </h1>
          <AbsenceSection />
        </div>
      )}
    </div>
  );
}
