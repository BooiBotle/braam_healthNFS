import { useNavigate } from "react-router-dom";
import { C, S, Icon, Btn, FileRow } from "../../components/shared";

export default function KYC() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitle}>KYC Verification</div>
      <div style={{ ...S.pageSub, marginBottom:22 }}>Upload your identity and financial documents for FICA compliance.</div>

      <FileRow label="South African ID Document" hint="Clear photo or scan of your ID book or smart card (front and back)" required/>
      <FileRow label="Proof of Address" hint="Utility bill or bank statement, not older than 3 months" required/>
      <FileRow label="Payslip / Proof of Income" hint="Most recent payslip or bank statement showing income" required/>
      <FileRow label="Bank Statement" hint="Last 3 months of bank statements for debit order verification" required/>
      <FileRow label="Selfie with ID" hint="Photo of yourself holding your ID document"/>

      <div style={{ fontSize:12, color:C.grey500, marginTop:6 }}>
        * Required documents. All documents are stored securely and POPIA-compliant. NFS Insure Consultant (FSP 53910) will review your submission within 2 business days.
      </div>
      <Btn variant="primary" size="md" sx={{ marginTop:18, background:C.navy }}>Submit Documents</Btn>
    </div>
  );
}
