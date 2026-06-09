import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Save, User, Phone, Calendar, CreditCard, CheckCircle, AlertCircle, MapPin, Mail, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EditableProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    sa_id_number: '',
    passport_number: '',
    date_of_birth: '',
    gender: '',
    address_line1: '',
    address_line2: '',
    suburb: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'ZA'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data && !error) {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          email: data.email || user.email || '',
          sa_id_number: data.sa_id_number || '',
          passport_number: data.passport_number || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          suburb: data.suburb || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || '',
          country: data.country || 'ZA'
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    const updatePayload: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      email: formData.email,
      sa_id_number: formData.sa_id_number || null,
      passport_number: formData.passport_number || null,
      date_of_birth: formData.date_of_birth || null,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2,
      suburb: formData.suburb,
      city: formData.city,
      province: formData.province,
      postal_code: formData.postal_code,
      country: formData.country
    };

    if (formData.gender) updatePayload.gender = formData.gender;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Profile...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: '800px', padding: 'var(--sp-8)' }}>
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: 'var(--sp-3)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: 'var(--sp-6)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--sp-2)',
              backgroundColor: message.type === 'success' ? 'rgba(34, 160, 107, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--status-success)' : 'var(--status-error)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500
            }}
          >
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        
        {/* SECTION 1: Personal Identity */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-2)' }}>
            <User size={18} color="var(--navy)" /> Personal Identity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input type="text" name="first_name" className="form-input" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input type="text" name="last_name" className="form-input" value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date of Birth</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="date" name="date_of_birth" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.date_of_birth} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gender</label>
              <select name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Identification */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-2)' }}>
            <CreditCard size={18} color="var(--navy)" /> Identification
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">SA ID Number</label>
              <div style={{ position: 'relative' }}>
                <Hash size={14} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="sa_id_number" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.sa_id_number} onChange={handleChange} placeholder="13-digit SA ID" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Passport Number</label>
              <div style={{ position: 'relative' }}>
                <Hash size={14} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="passport_number" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.passport_number} onChange={handleChange} placeholder="If non-SA citizen" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact Details */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-2)' }}>
            <Phone size={18} color="var(--navy)" /> Contact Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.email} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 'var(--sp-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" name="phone" className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.phone} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Address */}
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-4)', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-2)' }}>
            <MapPin size={18} color="var(--navy)" /> Address Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--sp-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Address Line 1</label>
              <input type="text" name="address_line1" className="form-input" value={formData.address_line1} onChange={handleChange} placeholder="Street address" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Address Line 2</label>
              <input type="text" name="address_line2" className="form-input" value={formData.address_line2} onChange={handleChange} placeholder="Apartment, suite, unit, etc. (optional)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Suburb</label>
                <input type="text" name="suburb" className="form-input" value={formData.suburb} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Province</label>
                <input type="text" name="province" className="form-input" value={formData.province} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Postal Code</label>
                <input type="text" name="postal_code" className="form-input" value={formData.postal_code} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditableProfile;


