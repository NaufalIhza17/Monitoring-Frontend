import { useEffect, useState } from "react";
import api from "@/lib/axios";
import type { User } from "@/types/user.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole: string;
  editUser?: User | null;
};

export default function UserFormModal({
  open,
  onClose,
  onSuccess,
  currentUserRole,
  editUser,
}: Props) {
  const isEdit = !!editUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [workStatus, setWorkStatus] = useState("off duty");
  const [employmentStatus, setEmploymentStatus] = useState("employed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editUser) {
      setName(editUser.name);
      setEmail(editUser.email);
      setRole(editUser.role);
      setEmploymentStatus(editUser.employmentStatus);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      setWorkStatus("off duty");
      setEmploymentStatus("employed");
    }
    setError("");
  }, [editUser, open]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/users/${editUser!.id}`, {
          name,
          email,
          role,
          workStatus,
          employmentStatus,
        });
      } else {
        await api.post("/users", {
          name,
          email,
          password,
          role,
          workStatus,
          employmentStatus,
        });
      }
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // HRD can only create/edit staff
  const roleOptions =
    currentUserRole === "admin"
      ? [
          { value: "staff", label: "Staff" },
          { value: "hrd", label: "HRD" },
        ]
      : [{ value: "staff", label: "Staff" }];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@company.com"
            />
          </div>
          {!isEdit && (
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Min. 6 characters"
              />
            </div>
          )}
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-1">
            <Label>Work Status</Label>
            <Select value={workStatus} onValueChange={setWorkStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="on break">On Break</SelectItem>
                <SelectItem value="off duty">Off Duty</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-1">
            <Label>Employment Status</Label>
            <Select
              value={employmentStatus}
              onValueChange={setEmploymentStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="on leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
