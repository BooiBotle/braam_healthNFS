import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getMemberDetails } from "../../lib/api/member";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle, Clock, XCircle, Shield, AlertTriangle,
  FileText, Eye, RefreshCw, Check, X, Info
} from "lucide-react";

const DOC_TYPES = [
  {
    key: 'sa_id',
    label: 'South African ID Document',
    hint: 'Clear photo or scan of your green ID book or smart ID card (front and back).',
    required: true,
  },
  {
    key: 'proof_of_address',
    label: 'Proof of Address',
    hint: 'Utility bill or bank statement not older than 3 months, showing your physical address.',
    required: true,
  },
  {
    key: 'proof_of_income',
    label: 'Payslip / Proof of Income',
    hint: 'Most recent payslip or bank statement confirming your income.',
    required: true,
  },
  {
    key: 'bank_statement',
    label: 'Bank Statement',
    hint: 'Last 3 months of bank statements — required for debit order verification.',
    required: true,
  },
  {
    key: 'selfie_with_id',
    label: 'Selfie with ID Document',
    hint: 'A clear photo of yourself holding your ID document next to your face.',
    required: false,
  },
];

type DocStatus = 'not_uploaded' | 'pending_review' | 'verified' | 'rejected';

interface KYCDoc {
  id: string;
  doc_type: string;
  status: DocStatus;
  file_url?: string;
  file_name?: string;
  admin_notes?: string;
  created_at: string;
}

const statusCfg = (status: DocStatus) => {
  switch (status) {
    case 'verified':      return { label: 'Verified',       color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle };
    case 'pending_review':return { label: 'Under Review',   color: '#d97706', bg: '#fffbeb', icon: Clock };
    case 'rejected':      return { label: 'Rejected',       color: '#dc2626', bg: '#fef2f2', icon: XCircle };
    default:              return { label: 'Not Uploaded',   color: '#94a3b8', bg: '#f8fafc', icon: FileText };
  }
};

export default function KYC() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState<any>(null);
  const [docs, setDocs] = useState<Record<string, KYCDoc>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycRequest, setKycRequest] = useState<any>(null); // pending admin request

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const mem = await getMemberDetails(user.id);
      setMember(mem);

      if (mem) {
        // Fetch existing KYC docs
        const { data: kycDocs } = await supabase
          .from('kyc_documents')
          .select('*')
          .eq('member_id', mem.id)
          .order('created_at', { ascending: false });

        // Map by doc_type (latest of each)
        const docMap: Record<string, KYCDoc> = {};
        for (const doc of (kycDocs || [])) {
          if (!docMap[doc.doc_type]) docMap[doc.doc_type] = doc;
        }
        setDocs(docMap);

        // Check for pending KYC request from admin
        const { data: req } = await supabase
          .from('kyc_requests')
          .select('*')
          .eq('member_id', mem.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setKycRequest(req);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (docType: string, file: File) => {
    if (!member?.id || !file) return;
    setUploading(docType);
    try {
      const ext = file.name.split('.').pop();
      const path = `kyc/${member.id}/${docType}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

      const existing = docs[docType];
      if (existing?.id) {
        await supabase.from('kyc_documents').update({
          file_url: publicUrl,
          file_name: file.name,
          status: 'pending_review',
          admin_notes: null,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('kyc_documents').insert({
          member_id: member.id,
          doc_type: docType,
          file_url: publicUrl,
          file_name: file.name,
          status: 'pending_review',
        });
      }
      await load();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0B1B3F' }} />
    </div>
  );

  const allRequired = DOC_TYPES.filter(d => d.required);
  const verifiedRequired = allRequired.filter(d => docs[d.key]?.status === 'verified').length;
  const pendingCount = Object.values(docs).filter(d => d.status === 'pending_review').length;
  const rejectedCount = Object.values(docs).filter(d => d.status === 'rejected').length;

  const overallStatus: 'complete' | 'pending' | 'action_required' | 'incomplete' =
    verifiedRequired === allRequired.length ? 'complete' :
    rejectedCount > 0 ? 'action_required' :
    pendingCount > 0 ? 'pending' : 'incomplete';

  const overallCfg = {
    complete:        { label: 'KYC Verified',         color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle },
    pending:         { label: 'Under Review',          color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Clock },
    action_required: { label: 'Action Required',       color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertTriangle },
    incomplete:      { label: 'Documents Required',    color: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: Shield },
  }[overallStatus];
  const OverallIcon = overallCfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 740 }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>KYC & Documents</h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>
          Upload your identity and financial documents for FICA compliance and debit mandate verification.
        </p>
      </div>

      {/* Admin KYC request banner */}
      {kycRequest && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20, padding: '16px 20px', background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', marginBottom: 3 }}>
              ⚠️ Admin has requested your KYC documents
            </div>
            <div style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.5 }}>
              {kycRequest.message || 'Your clinic administrator has requested that you upload or update your KYC documents. Please do so as soon as possible to keep your policy active.'}
            </div>
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>
              Requested: {new Date(kycRequest.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Overall KYC status */}
      <div style={{ marginBottom: 24, padding: '20px 22px', background: overallCfg.bg, border: `1px solid ${overallCfg.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${overallCfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <OverallIcon size={24} color={overallCfg.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: overallCfg.color }}>{overallCfg.label}</div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>
            {verifiedRequired}/{allRequired.length} required documents verified
            {pendingCount > 0 && ` · ${pendingCount} under review`}
            {rejectedCount > 0 && ` · ${rejectedCount} need resubmission`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {allRequired.map(d => (
            <div key={d.key} style={{ width: 10, height: 10, borderRadius: '50%', background: docs[d.key]?.status === 'verified' ? '#16a34a' : docs[d.key]?.status === 'pending_review' ? '#f59e0b' : docs[d.key]?.status === 'rejected' ? '#dc2626' : '#e2e8f0' }} />
          ))}
        </div>
      </div>

      {/* Info block */}
      <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, display: 'flex', gap: 10 }}>
        <Info size={15} color="#0369a1" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: '#0c4a6e', lineHeight: 1.6 }}>
          All documents are stored securely and are POPIA-compliant. <strong>NFS Insure Consultant (FSP 53910)</strong> will review your submission within 2 business days. Bank statements are required for debit order activation.
        </div>
      </div>

      {/* Document rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DOC_TYPES.map(docType => {
          const doc = docs[docType.key];
          const status: DocStatus = doc?.status || 'not_uploaded';
          const cfg = statusCfg(status);
          const StatusIcon = cfg.icon;
          const isUploading = uploading === docType.key;

          return (
            <motion.div key={docType.key}
              style={{
                background: '#fff', borderRadius: 14,
                border: status === 'rejected' ? '1.5px solid #fca5a5' : status === 'verified' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Doc icon */}
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <StatusIcon size={20} color={cfg.color} />
                  </div>

                  {/* Label + hint */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{docType.label}</span>
                      {docType.required && <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 10 }}>REQUIRED</span>}
                      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{docType.hint}</div>

                    {/* Rejection notes */}
                    {status === 'rejected' && doc?.admin_notes && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12, color: '#991b1b', fontWeight: 500 }}>
                        <strong>Admin note:</strong> {doc.admin_notes}
                      </div>
                    )}

                    {/* View uploaded file */}
                    {doc?.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, fontWeight: 600, color: '#0369a1', textDecoration: 'none' }}>
                        <Eye size={13} /> View uploaded file — {doc.file_name}
                      </a>
                    )}
                  </div>
                </div>

                {/* Upload button */}
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                  <label htmlFor={`kyc-${docType.key}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '9px 18px', borderRadius: 9,
                      background: status === 'verified' ? '#f0fdf4' : '#0B1B3F',
                      color: status === 'verified' ? '#16a34a' : '#fff',
                      border: status === 'verified' ? '1px solid #bbf7d0' : 'none',
                      fontSize: 13, fontWeight: 700,
                      cursor: isUploading ? 'wait' : 'pointer',
                      opacity: isUploading ? 0.7 : 1,
                    }}>
                    {isUploading ? (
                      <><RefreshCw size={14} /> Uploading…</>
                    ) : status === 'verified' ? (
                      <><Check size={14} /> Replace Document</>
                    ) : (
                      <><Upload size={14} /> {doc ? 'Replace' : 'Upload'} Document</>
                    )}
                  </label>
                  <input
                    id={`kyc-${docType.key}`}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    disabled={isUploading}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(docType.key, file);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>
        <strong style={{ color: '#64748b' }}>Privacy Notice:</strong> Your documents are encrypted and stored securely. They are only accessible to authorised NFS Insure staff for FICA compliance purposes, in accordance with the Protection of Personal Information Act (POPIA). NFS Insure Consultant (Pty) Ltd · FSP 53910.
      </div>
    </motion.div>
  );
}
