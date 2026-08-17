import { supabase } from '../supabase';

export interface AuditLogEntry {
  clinic_id?: string;
  performed_by: string;
  performer_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  metadata?: any;
  details?: string;
}

export const logAudit = async (entry: AuditLogEntry) => {
  try {
    const { error } = await supabase.from('audit_log').insert([entry]);
    if (error) {
      console.error('Failed to write audit log:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
};
