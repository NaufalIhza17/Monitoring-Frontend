import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  role: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  employed: "bg-green-500/20 text-green-400 border-green-500/30",
  "on leave": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  terminated: "bg-red-500/20 text-red-400 border-red-500/30",
  resigned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="grid grid-cols-2 gap-6 leading-none pt-5">
      <div className="aspect-square col-span-1 rounded-lg bg-[#D9D9D9]/10 flex items-center justify-center">
        <span className="text-2xl font-bold text-black/20">{initials}</span>
      </div>

      <div className="col-span-1 flex flex-col items-center justify-center gap-4">
        <div className="text-center flex flex-col">
          <p className="font-semibold text-2xl">{user.name}</p>
          <p className="text-muted-foreground text-base">{user.email}</p>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Badge
            variant="outline"
            className={`w-fit px-8 py-4 text-sm capitalize ${statusColor["role"]}`}
          >
            {user.role}
          </Badge>{" "}
          <Badge
            variant="outline"
            className={`w-fit px-8 py-4 text-sm capitalize ${statusColor[user.employmentStatus]}`}
          >
            {user.employmentStatus}
          </Badge>{" "}
        </div>
      </div>
    </div>
  );
}
