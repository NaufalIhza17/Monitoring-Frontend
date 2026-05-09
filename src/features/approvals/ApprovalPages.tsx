import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PendingRecord = {
  id: string;
  photoUrl: string;
  clockInTime: string;
  user: {
    id: string;
    name: string;
    role: string;
    workStatus: string;
  };
};

type HistoryRecord = {
  id: string;
  photoUrl: string;
  clockInTime: string;
  approvalStatus: "approved" | "denied";
  approvedAt: string;
  approvedBy: string | null;
  user: {
    name: string;
    role: string;
  };
};

type HistoryPaginated = {
  data: HistoryRecord[];
  total: number;
  page: number;
  totalPages: number;
};

export default function ApprovalsPage() {
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<PendingRecord | null>(
    null,
  );
  const [denyTarget, setDenyTarget] = useState<PendingRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [history, setHistory] = useState<HistoryPaginated | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/pending");
      setRecords(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (p = 1) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(
        `/attendance/approval-history?page=${p}&limit=10`,
      );
      setHistory(res.data);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    fetchHistory(historyPage);
  }, [historyPage]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/attendance/${approveTarget.id}/approve`);
      setApproveTarget(null);
      fetchPending();
    } finally {
      setActionLoading(false);
    }

    fetchHistory(historyPage);
  };

  const handleDeny = async () => {
    if (!denyTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/attendance/${denyTarget.id}/deny`);
      setDenyTarget(null);
      fetchPending();
    } finally {
      setActionLoading(false);
    }

    fetchHistory(historyPage);
  };

  const workStatusColor: Record<string, string> = {
    working: "bg-green-500/20 text-green-400 border-green-500/30",
    "on break": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "off duty": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "photo revision": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pending clock-in photo approvals
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Work Status</TableHead>
              <TableHead>Clock In Time</TableHead>
              <TableHead>Photo</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  No pending approvals
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.user.name}
                  </TableCell>
                  <TableCell>
                    <Badge className="capitalize">{record.user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${workStatusColor[record.user.workStatus]}`}
                    >
                      {record.user.workStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(record.clockInTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() =>
                        setPhotoUrl(`http://localhost:3000${record.photoUrl}`)
                      }
                    >
                      View Photo
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setApproveTarget(record)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDenyTarget(record)}
                    >
                      Deny
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approval History */}
      <div className="mt-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Approval History</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Past approved and denied clock-ins
          </p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Approved At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : history?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No approval history yet
                  </TableCell>
                </TableRow>
              ) : (
                history?.data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.user.name}
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize">
                        {record.user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.clockInTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.approvedAt
                        ? new Date(record.approvedAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          record.approvalStatus === "approved"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {record.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.photoUrl ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setPhotoUrl(
                              `http://localhost:3000${record.photoUrl}`,
                            )
                          }
                        >
                          View Photo
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Deleted
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* History Pagination */}
        {history && history.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(historyPage - 1) * 10 + 1}–
              {Math.min(historyPage * 10, history.total)} of {history.total}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={historyPage === history.totalPages}
                onClick={() => setHistoryPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <Dialog open={!!photoUrl} onOpenChange={() => setPhotoUrl(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proof Photo</DialogTitle>
          </DialogHeader>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="proof"
              className="w-full rounded-lg object-cover"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirm */}
      <AlertDialog
        open={!!approveTarget}
        onOpenChange={() => setApproveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Clock In</AlertDialogTitle>
            <AlertDialogDescription>
              Approve clock-in for <strong>{approveTarget?.user.name}</strong>?
              Their status will change to <strong>working</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deny Confirm */}
      <AlertDialog open={!!denyTarget} onOpenChange={() => setDenyTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deny Clock In</AlertDialogTitle>
            <AlertDialogDescription>
              Deny clock-in for <strong>{denyTarget?.user.name}</strong>? They
              will need to resubmit their photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeny}
              disabled={actionLoading}
            >
              Deny
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
