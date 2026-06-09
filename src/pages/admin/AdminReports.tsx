import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileIcon } from 'lucide-react';

const AdminReports = () => {
  const [reportType, setReportType] = useState('member_list');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { id: 'member_list', label: 'Member List', desc: 'Full export of active members and dependants' },
    { id: 'consultation_summary', label: 'Consultation Summary', desc: 'Visit metrics and clinical workload' },
    { id: 'revenue_summary', label: 'Revenue Summary', desc: 'Income by plan and payment method' },
    { id: 'kyc_status', label: 'KYC Status Report', desc: 'Pending and rejected verification logs' }
  ];

  const generateCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data found for this report.");
      return;
    }
    
    // Extract headers
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const csvRows = data.map(row => {
      return headers.map(header => {
        let value = row[header];
        if (value === null || value === undefined) value = '';
        if (typeof value === 'object') value = JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    // Combine
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      let query;
      
      switch (reportType) {
        case 'member_list':
          query = await supabase
            .from('members')
            .select(`
              id, status, created_at, card_number,
              profiles!inner(first_name, last_name, email, sa_id_number, phone),
              plans!inner(name)
            `);
            
          if (query.data) {
            const formatted = query.data.map((member: any) => {
              const profiles = member.profiles as any;
              const plans = member.plans as any;
              return {
                'ID': member.id,
                'Member Name': profiles ? `${profiles.first_name || profiles[0]?.first_name || ''} ${profiles.last_name || profiles[0]?.last_name || ''}` : 'Unknown',
                'Email': profiles ? (profiles.email || profiles[0]?.email || '') : '',
                'Phone': profiles ? (profiles.phone || profiles[0]?.phone || '') : '',
                'ID Number': profiles ? (profiles.sa_id_number || profiles[0]?.sa_id_number || '') : '',
                'Plan': plans ? (plans.name || plans[0]?.name || 'No Plan') : 'No Plan',
                'Card Number': member.card_number,
                'Status': member.status,
                'Joined At': new Date(member.created_at).toLocaleDateString()
              };
            });
            generateCSV(formatted, 'Member_List_Report');
          }
          break;
          
        case 'consultation_summary':
          query = await supabase
            .from('consultations')
            .select(`
              id, consultation_type, status, visited_at, diagnosis,
              members(profiles(first_name, last_name, sa_id_number))
            `);
            
          if (query.data) {
            const formatted = query.data.map((c: any) => {
              const profile = Array.isArray(c.members?.profiles) ? c.members.profiles[0] : c.members?.profiles;
              return {
                ConsultationID: c.id,
                PatientName: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
                PatientIDNumber: profile?.sa_id_number || '',
                Type: c.consultation_type,
                Status: c.status,
                Diagnosis: c.diagnosis || '',
                Date: c.visited_at
              };
            });
            generateCSV(formatted, 'Consultation_Summary');
          }
          break;

        case 'kyc_status':
          query = await supabase
            .from('kyc_documents')
            .select(`
              id, doc_type, status, created_at,
              members(profiles(first_name, last_name, sa_id_number))
            `);
            
          if (query.data) {
            const formatted = query.data.map((k: any) => {
              const profile = Array.isArray(k.members?.profiles) ? k.members.profiles[0] : k.members?.profiles;
              return {
                DocumentID: k.id,
                MemberName: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
                IDNumber: profile?.sa_id_number || '',
                DocumentType: k.doc_type,
                Status: k.status,
                SubmittedAt: k.created_at
              };
            });
            generateCSV(formatted, 'KYC_Status_Report');
          }
          break;
          
        default:
          alert("This report is not implemented yet.");
          break;
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1000px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Data Reports & Exports
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Generate analytical reports and export live system data.
          </p>
        </div>
      </div>

      <div className="responsive-grid-sidebar">
        
        {/* Report Selector */}
        <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          {reportTypes.map((report) => (
            <div 
              key={report.id}
              onClick={() => setReportType(report.id)}
              style={{
                padding: '1.25rem', borderRadius: '12px', border: reportType === report.id ? '2px solid #1c2340' : '1px solid #e2e8f0',
                background: reportType === report.id ? '#f8fafc' : '#ffffff',
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'center'
              }}
            >
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '8px', 
                background: reportType === report.id ? '#1c2340' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: reportType === report.id ? '#ffffff' : '#64748b'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{report.label}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>{report.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Panel */}
        <div style={{ 
          background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', 
          padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '2rem'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>
            Configuration
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="#64748b" /> Date Range
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="year_to_date">Year to Date</option>
                <option value="all_time">All Time</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} color="#64748b" /> Export Format
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setFormat('csv')}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: format === 'csv' ? '2px solid #1c2340' : '1px solid #e2e8f0',
                    background: format === 'csv' ? '#f8fafc' : '#ffffff',
                    color: format === 'csv' ? '#1c2340' : '#64748b',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <FileSpreadsheet size={20} />
                  CSV
                </button>
                <button
                  onClick={() => setFormat('pdf')}
                  disabled
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#94a3b8',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'not-allowed',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                  }}
                  title="PDF coming soon"
                >
                  <FileIcon size={20} />
                  PDF (Pro)
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  width: '100%', padding: '0.875rem', borderRadius: '8px',
                  background: '#1c2340', color: '#ffffff', border: 'none',
                  fontSize: '0.9375rem', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  opacity: generating ? 0.8 : 1, transition: 'all 0.2s'
                }}
              >
                {generating ? 'Querying Database...' : <><Download size={18} /> Export Data</>}
              </button>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AdminReports;
