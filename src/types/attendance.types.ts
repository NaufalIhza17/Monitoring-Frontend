export type ApprovalStatus = "pending" | "approved" | "denied";

export type Attendance = {
  id: string;
  userId: string;
  date: string;
  clockInTime: string;
  clockOutTime: string | null;
  photoUrl: string;
  approvalStatus: ApprovalStatus;
  totalBreakMinutes: number;
  totalWorkingMinutes: number;
  isOnBreak: boolean;
  breakStartTime: string | null;
  createdAt: string;
  isInvalid: boolean;
  invalidReason: string | null;
};
