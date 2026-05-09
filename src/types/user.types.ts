export type Role = "staff" | "hrd" | "admin";

export type WorkStatus =
  | "working"
  | "on break"
  | "off duty"
  | "pending"
  | "photo revision";

export type EmploymentStatus =
  | "employed"
  | "on leave"
  | "terminated"
  | "resigned";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  workStatus: WorkStatus;
  employmentStatus: EmploymentStatus;
  createdAt: string;
};

export type PaginatedUsers = {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
