import { useMemo } from "react";
import {
  Activity,
  Briefcase,
  Clock3,
  Coffee,
  UserCheck,
  Users,
} from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  workStatus: string;
  employmentStatus: string;
};

type Props = {
  team?: TeamMember[];
};

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <div className="rounded-2xl bg-white/10 p-2">{icon}</div>
      </div>

      <div className="flex items-end gap-2">
        <h2 className="text-4xl font-bold leading-none">{value}</h2>
        <span className="text-muted-foreground text-sm pb-1">people</span>
      </div>
    </div>
  );
}

export default function AdminAnalytics({ team = [] }: Props) {
  const analytics = useMemo(() => {
    return {
      totalEmployees: team.filter((m) => m.employmentStatus === "employed")
        .length,

      activeNow: team.filter((m) => m.workStatus === "working").length,

      onBreak: team.filter((m) => m.workStatus === "on break").length,

      pendingApproval: team.filter((m) => m.workStatus === "pending").length,

      offDuty: team.filter((m) => m.workStatus === "off duty").length,

      hrdCount: team.filter((m) => m.role === "hrd").length,
    };
  }, [team]);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Total Employees"
          value={analytics.totalEmployees}
          icon={<Users size={18} />}
        />

        <StatCard
          title="Currently Working"
          value={analytics.activeNow}
          icon={<Activity size={18} />}
        />

        <StatCard
          title="On Break"
          value={analytics.onBreak}
          icon={<Coffee size={18} />}
        />

        <StatCard
          title="Pending Approval"
          value={analytics.pendingApproval}
          icon={<Clock3 size={18} />}
        />

        <StatCard
          title="Off Duty"
          value={analytics.offDuty}
          icon={<UserCheck size={18} />}
        />

        <StatCard
          title="HRD Members"
          value={analytics.hrdCount}
          icon={<Briefcase size={18} />}
        />
      </div>

      {/* Workforce Summary */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Workforce Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Live operational summary of today's workforce.
            </p>
          </div>

          <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            System Active
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 h-full">
          <div className="rounded-2xl bg-black/20 p-5 flex flex-col gap-4 h-fit">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Workforce Status
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Working</span>
                  <span>{analytics.activeNow}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{
                      width: `${(analytics.activeNow / Math.max(team.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>On Break</span>
                  <span>{analytics.onBreak}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${(analytics.onBreak / Math.max(team.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Pending</span>
                  <span>{analytics.pendingApproval}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{
                      width: `${(analytics.pendingApproval / Math.max(team.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-5 flex flex-col justify-between h-fit">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Today's Insight
              </p>

              <h2 className="text-3xl font-bold mt-4 leading-tight max-w-sm">
                {analytics.activeNow > analytics.offDuty
                  ? "Most employees are currently active and working."
                  : "A large portion of employees are currently off duty."}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <p className="text-muted-foreground text-sm">Active Rate</p>
                <h3 className="text-3xl font-bold mt-2">
                  {team.length
                    ? Math.round((analytics.activeNow / team.length) * 100)
                    : 0}
                  %
                </h3>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <p className="text-muted-foreground text-sm">Pending Rate</p>
                <h3 className="text-3xl font-bold mt-2">
                  {team.length
                    ? Math.round(
                        (analytics.pendingApproval / team.length) * 100,
                      )
                    : 0}
                  %
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
