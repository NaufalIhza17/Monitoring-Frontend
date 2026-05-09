import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type HistoryRecord = {
  id: string;
  date: string;
  clockInTime: string;
  clockOutTime: string | null;
  totalWorkingMinutes: number;
  totalBreakMinutes: number;
  overtimeMinutes: number;
  approvalStatus: string;
  isInvalid: boolean;
  user: { id: string; name: string; role: string };
};

type Paginated = {
  data: HistoryRecord[];
  total: number;
  page: number;
  totalPages: number;
};

const fmt = (n: number) => String(n).padStart(2, "0");

function formatMins(mins: number) {
  return `${fmt(Math.floor(mins / 60))}:${fmt(mins % 60)}`;
}

function formatTime(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ record }: { record: HistoryRecord }) {
  if (record.isInvalid)
    return (
      <Badge
        variant="outline"
        className="bg-red-500/20 text-red-400 border-red-500/30"
      >
        Invalid
      </Badge>
    );
  if (!record.clockOutTime)
    return (
      <Badge
        variant="outline"
        className="bg-blue-500/20 text-blue-400 border-blue-500/30"
      >
        Active
      </Badge>
    );
  if (record.overtimeMinutes > 0)
    return (
      <Badge
        variant="outline"
        className="bg-orange-500/20 text-orange-400 border-orange-500/30"
      >
        Overtime
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="bg-green-500/20 text-green-400 border-green-500/30"
    >
      Completed
    </Badge>
  );
}

function HistoryTable({
  data,
  loading,
  showUser,
  page,
  totalPages,
  total,
  onPageChange,
}: {
  data: HistoryRecord[];
  loading: boolean;
  showUser: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {showUser && <TableHead>Name</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Working Hours</TableHead>
              <TableHead>Break</TableHead>
              <TableHead>Overtime</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={showUser ? 8 : 7}
                  className="text-center py-10 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showUser ? 8 : 7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => (
                <TableRow key={record.id}>
                  {showUser && (
                    <TableCell className="font-medium">
                      {record.user.name}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatTime(record.clockInTime)}</TableCell>
                  <TableCell>{formatTime(record.clockOutTime)}</TableCell>
                  <TableCell>
                    {formatMins(record.totalWorkingMinutes)}
                  </TableCell>
                  <TableCell>{record.totalBreakMinutes}m</TableCell>
                  <TableCell>
                    {record.overtimeMinutes > 0 ? (
                      <span className="text-orange-400">
                        {formatMins(record.overtimeMinutes)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge record={record} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of{" "}
            {total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const user = useAuthStore((state) => state.user);
  const isHrd = user?.role === "hrd";

  const [myData, setMyData] = useState<Paginated | null>(null);
  const [myPage, setMyPage] = useState(1);
  const [myLoading, setMyLoading] = useState(false);

  const [teamData, setTeamData] = useState<Paginated | null>(null);
  const [teamPage, setTeamPage] = useState(1);
  const [teamLoading, setTeamLoading] = useState(false);

  const fetchMy = async (p = 1) => {
    setMyLoading(true);
    try {
      const res = await api.get(`/attendance/history?page=${p}&limit=10`);
      // filter to only current user's records
      const filteredData = res.data.data.filter(
        (r: HistoryRecord) => r.user.id === user?.id,
      );

      const filtered = {
        ...res.data,
        data: filteredData,
        total: filteredData.length,
        totalPages: 1,
      };
      setMyData(filtered);
    } finally {
      setMyLoading(false);
    }
  };

  const fetchTeam = async (p = 1) => {
    setTeamLoading(true);
    try {
      const res = await api.get(`/attendance/history?page=${p}&limit=10`);
      setTeamData(res.data);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchMy(myPage);
  }, [myPage]);
  useEffect(() => {
    if (isHrd) fetchTeam(teamPage);
  }, [teamPage, isHrd]);

  return (
    <div className="p-6 space-y-10">
      {/* My History */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">My History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal attendance records
          </p>
        </div>
        <HistoryTable
          data={myData?.data ?? []}
          loading={myLoading}
          showUser={false}
          page={myPage}
          totalPages={myData?.totalPages ?? 1}
          total={myData?.total ?? 0}
          onPageChange={setMyPage}
        />
      </div>

      {/* Team History — HRD only */}
      {isHrd && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Team History</h2>
            <p className="text-muted-foreground text-sm mt-1">
              All staff & HRD attendance records
            </p>
          </div>
          <HistoryTable
            data={teamData?.data ?? []}
            loading={teamLoading}
            showUser={true}
            page={teamPage}
            totalPages={teamData?.totalPages ?? 1}
            total={teamData?.total ?? 0}
            onPageChange={setTeamPage}
          />
        </div>
      )}
    </div>
  );
}
