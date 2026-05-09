import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import type { User, PaginatedUsers } from "@/types/user.types";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserFormModal from "@/features/manage/UserFormModal";
import ChangePasswordModal from "@/features/manage/ChangePasswordModal";

const employmentStatusColor: Record<string, string> = {
  employed: "bg-green-500/20 text-green-400 border-green-500/30",
  "on leave": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  terminated: "bg-red-500/20 text-red-400 border-red-500/30",
  resigned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function ManagePage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${p}&limit=10`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    await api.delete(`/users/${deleteUser.id}`);
    setDeleteUser(null);
    fetchUsers(page);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.role === "admin" ? "Staff & HRD accounts" : "Staff accounts"}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New User</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-clip">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Employment Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-white">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${employmentStatusColor[u.employmentStatus]}`}
                    >
                      {u.employmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditUser(u)}
                      className="text-black"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPasswordUser(u)}
                      className="text-black"
                    >
                      Password
                    </Button>
                    {user?.role === "admin" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteUser(u)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of{" "}
            {data.total} users
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <UserFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          fetchUsers(page);
        }}
        currentUserRole={user?.role ?? "hrd"}
      />

      {/* Edit Modal */}
      <UserFormModal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSuccess={() => {
          setEditUser(null);
          fetchUsers(page);
        }}
        currentUserRole={user?.role ?? "hrd"}
        editUser={editUser}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={!!passwordUser}
        onClose={() => setPasswordUser(null)}
        onSuccess={() => setPasswordUser(null)}
        user={passwordUser}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteUser?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
