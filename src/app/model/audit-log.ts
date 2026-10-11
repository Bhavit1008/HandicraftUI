export interface AuditChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  category?: string;
  itemCode?: string;
  performedBy?: string;
  performedByRole?: string;
  performedByLocation?: string;
  timestamp: number;
  summary: string;
  changes: AuditChange[];
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
