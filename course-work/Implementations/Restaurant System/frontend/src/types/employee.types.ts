export interface Employee {
  id: number;
  fullName: string;
  salary: number;
  phone: number;
  hireDate: string;
  role: string | null;
}

export interface EmployeeSearchParams {
  name?: string;
  role?: string;
  hiredAfter?: string;
  hiredBefore?: string;
  minSalary?: number;
  maxSalary?: number;
}