import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberDetails, getDependants, addDependant, type Dependant } from "../../lib/api/member";
import { C, S, Icon, Btn, Card } from "../../components/shared";
import Modal from "../../components/Modal";

export default function Dependants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Dependant State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    relationship: "child",
    date_of_birth: "",
    sa_id_number: ""
  });
  
  const load = async () => {
    if (user) {
      setLoading(true);
      const mem = await getMemberDetails(user.id);
      if (mem) {
        setMemberId(mem.id);
        setClinicId(mem.clinic_id);
        const data = await getDependants(mem.id);
        setDependants(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleAddDependant = async () => {
    if (!memberId || !clinicId) return;
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDependant(memberId, clinicId, formData);
      setFormData({
        first_name: "",
        last_name: "",
        relationship: "child",
        date_of_birth: "",
        sa_id_number: ""
      });
      setIsModalOpen(false);
      await load();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to add dependant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={S.back} onClick={()=>navigate("/member")}><Icon name="back" size={15}/> Back to Dashboard</div>
      <div style={S.pageTitleRow}>
        <div>
          <div style={S.pageTitle}>Dependants</div>
          <div style={S.pageSub}>Manage family members linked to your plan.</div>
        </div>
        <Btn variant="primary" size="md" sx={{ background:C.navy }} onClick={() => setIsModalOpen(true)}>
          <Icon name="plus" size={14}/>Add Dependant
        </Btn>
      </div>
      <Card sx={{ padding:0 }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Name","Relationship","Date of Birth","Added"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"14px 20px", fontSize:11.5, fontWeight:700, color:C.grey500, textTransform:"uppercase", letterSpacing:"0.6px", borderBottom:`1px solid ${C.grey100}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:"34px 0", color:C.grey500, fontSize:13.5 }}>Loading dependants...</td></tr>
            ) : dependants.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:"34px 0", color:C.grey500, fontSize:13.5 }}>No dependants added to your profile.</td></tr>
            ) : (
              dependants.map(d => (
                <tr key={d.id}>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.navy, fontWeight:600 }}>{d.first_name} {d.last_name}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.grey700, textTransform: "capitalize" }}>{d.relationship}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.grey700 }}>{d.date_of_birth}</td>
                  <td style={{ padding:"14px 20px", borderBottom:`1px solid ${C.grey100}`, color:C.grey500 }}>Added recently</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Dependant"
        maxWidth="500px"
        actions={
          <>
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAddDependant} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Dependant"}
            </Btn>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>First Name</label>
              <input 
                style={S.input} 
                value={formData.first_name} 
                onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                placeholder="First Name"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>Last Name</label>
              <input 
                style={S.input} 
                value={formData.last_name} 
                onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                placeholder="Last Name"
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>Relationship</label>
            <select 
              style={S.input} 
              value={formData.relationship} 
              onChange={(e) => setFormData({...formData, relationship: e.target.value})}
            >
              <option value="child">Child</option>
              <option value="spouse">Spouse</option>
              <option value="partner">Partner</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>Date of Birth</label>
            <input 
              type="date"
              style={S.input} 
              value={formData.date_of_birth} 
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} 
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>ID Number (Optional)</label>
            <input 
              style={S.input} 
              value={formData.sa_id_number} 
              onChange={(e) => setFormData({...formData, sa_id_number: e.target.value})} 
              placeholder="SA ID or Passport"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
