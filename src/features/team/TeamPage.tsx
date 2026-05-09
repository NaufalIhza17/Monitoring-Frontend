import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  workStatus: string;
  employmentStatus: string;
};

const workStatusColor: Record<string, string> = {
  working: "bg-green-500/20 text-green-400 border-green-500/30",
  "on break": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "off duty": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "photo revision": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const employmentStatusColor: Record<string, string> = {
  employed: "bg-green-500/20 text-green-400 border-green-500/30",
  "on leave": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  terminated: "bg-red-500/20 text-red-400 border-red-500/30",
  resigned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const workStatusDot: Record<string, string> = {
  working: "bg-green-400",
  "on break": "bg-yellow-400",
  "off duty": "bg-zinc-500",
  pending: "bg-blue-400",
  "photo revision": "bg-orange-400",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/attendance/team")
      .then((res) => setTeam(res.data))
      .finally(() => setLoading(false));
  }, []);

  const sortedTeam = [...team].sort((a, b) => {
    const workPriority: Record<string, number> = {
      working: 0,
      "on break": 1,
      pending: 2,
      "photo revision": 3,
      "off duty": 4,
    };

    const employmentPriority: Record<string, number> = {
      employed: 0,
      "on leave": 1,
      resigned: 2,
      terminated: 3,
    };

    const workDiff =
      (workPriority[a.workStatus] ?? 999) - (workPriority[b.workStatus] ?? 999);

    if (workDiff !== 0) return workDiff;

    return (
      (employmentPriority[a.employmentStatus] ?? 999) -
      (employmentPriority[b.employmentStatus] ?? 999)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Who's working today
        </p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-20">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedTeam.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-[#3C3C3C] p-5 flex flex-col gap-4"
            >
              {/* Avatar + status dot */}
              <div className="relative w-fit">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {getInitials(member.name)}
                  </span>
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#3C3C3C] ${workStatusDot[member.workStatus] ?? "bg-zinc-500"}`}
                />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 min-w-0">
                <p className="font-semibold text-sm truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {member.role}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1.5">
                <Badge
                  variant="outline"
                  className={`capitalize text-xs w-fit ${workStatusColor[member.workStatus]}`}
                >
                  {member.workStatus}
                </Badge>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs w-fit ${employmentStatusColor[member.employmentStatus]}`}
                >
                  {member.employmentStatus}
                </Badge>
              </div>
            </div>
          ))}

          {team.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full text-center py-20">
              No team members found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
