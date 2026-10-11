export type EmployeeRole = 'admin' | 'store_manager';

export interface Employee {
  id?: string;
  employeeName: string;
  employeeNumber?: string;
  employeeEmail?: string;
  assignedLocations: string[];
  password?: string;
  role: EmployeeRole;
  createdAt?: number;
}
