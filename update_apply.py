import re

with open('src/pages/auth/ApplyPage.tsx', 'r') as f:
    content = f.read()

# 1. Update steps array
content = content.replace(
    "const steps = ['Account', 'Personal', 'Clinic', 'Plan', 'Disclaimers', 'Banking', 'Review'];",
    "const steps = ['Account', 'Verify Email', 'Personal', 'Clinic', 'Plan', 'Disclaimers', 'Banking', 'Review'];"
)

# 2. Add OTP state and update formData
content = content.replace(
    "const [errorMsg, setErrorMsg] = useState('');",
    "const [errorMsg, setErrorMsg] = useState('');\n  const [otpCode, setOtpCode] = useState('');"
)

content = content.replace(
    "hasPreExisting: false, isPregnant: false, acceptsTerms: false,",
    "hasPreExisting: false, isPregnant: false, agreedTerms: false,\n    agreedPopia: false, agreedMedical: false, agreedDebit: false,"
)

# 3. Update handleNext
handleNext_old = """  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Step 1: Handle Google Auth immediately if selected
    if (currentStep === 1 && formData.authMethod === 'google') {
      await signInWithOAuth('google', window.location.origin + '/apply');
      return; // Stop here, page will redirect
    }

    // Step 2: Validate ID Number
    if (currentStep === 2 && idType === 'sa_id') {
      if (!isValidSAId(formData.idNumber)) {
        alert("Please enter a valid 13-digit South African ID number.");
        return;
      }
    }

    if (currentStep < steps.length) setCurrentStep(c => c + 1);
  };"""

handleNext_new = """  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    
    // Step 1: Create Account
    if (currentStep === 1) {
      if (formData.authMethod === 'google') {
        await signInWithOAuth('google', window.location.origin + '/apply');
        return;
      }
      setIsSubmitting(true);
      try {
        if (formData.authMethod === 'password') {
          const metadata = {
            first_name: formData.email.split('@')[0],
            last_name: '',
            portal_role: 'member'
          };
          const { error } = await signUpWithPassword(formData.email, formData.password, metadata);
          if (error) throw error;
        } else if (formData.authMethod === 'magiclink') {
          const { error } = await loginWithOtp(formData.email);
          if (error) throw error;
        }
        setCurrentStep(2); // Go to Verify Email
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to create account.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Step 2: Verify OTP
    if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        const type = formData.authMethod === 'password' ? 'signup' : 'magiclink';
        const { error } = await supabase.auth.verifyOtp({ email: formData.email, token: otpCode, type: type as any });
        if (error) throw error;
        setCurrentStep(3); // Go to Personal
      } catch (err: any) {
        setErrorMsg('Invalid verification code.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Step 3: Validate ID Number and Phone
    if (currentStep === 3) {
      if (idType === 'sa_id' && !isValidSAId(formData.idNumber)) {
        alert("Please enter a valid 13-digit South African ID number.");
        return;
      }
      const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
      if (!phoneRegex.test(formData.mobile)) {
        alert("Please enter a valid South African mobile number (e.g., 0821234567).");
        return;
      }
    }

    if (currentStep < steps.length) setCurrentStep(c => c + 1);
  };"""

content = content.replace(handleNext_old, handleNext_new)

# 4. Update handleSubmit
handleSubmit_old = """      let authUserId = user?.id || null;

      // 1. Authenticate based on chosen method (only if not already authenticated via Google)
      if (!authUserId) {
        if (formData.authMethod === 'password') {
          const { data, error } = await signUpWithPassword(formData.email, formData.password);
          if (error) throw error;
          authUserId = data.user?.id;
        } else if (formData.authMethod === 'magiclink') {
          const { error } = await loginWithOtp(formData.email);
          if (error) throw error;
        }
      }

      // Ensure a clinicId is assigned
      let clinicIdToUse = formData.clinicId;
      if (!clinicIdToUse && clinics.length > 0) {
        clinicIdToUse = clinics[0].id;
      }

      // Ensure planId is valid
      let planIdToUse = formData.planId;
      if (!planIdToUse) {
        const { data: dbPlan } = await supabase.from('plans').select('id').eq('is_active', true).limit(1).single();
        planIdToUse = dbPlan?.id || '00000000-0000-0000-0000-000000000000';
      }

      // 2. Create Application Record with selected clinic_id
      const { error: appError } = await supabase.from('applications').insert({
        clinic_id: clinicIdToUse || '00000000-0000-0000-0000-000000000000',
        plan_id: planIdToUse,
        profile_id: authUserId,
        status: 'submitted',
        applicant_name: `${formData.firstName} ${formData.lastName}`,
        applicant_phone: formData.mobile,
        applicant_email: formData.email,
        applicant_id_number: formData.idNumber,
        source: 'self_service'
      });"""

handleSubmit_new = """      let authUserId = (await supabase.auth.getUser()).data.user?.id || user?.id || null;
      if (!authUserId) throw new Error("User session not found. Please log in again.");

      // Ensure a clinicId is assigned
      let clinicIdToUse = formData.clinicId;
      if (!clinicIdToUse && clinics.length > 0) {
        clinicIdToUse = clinics[0].id;
      }

      // Ensure planId is valid
      let planIdToUse = formData.planId;
      if (!planIdToUse) {
        const { data: dbPlan } = await supabase.from('plans').select('id').eq('is_active', true).limit(1).single();
        planIdToUse = dbPlan?.id || '00000000-0000-0000-0000-000000000000';
      }

      // 2. Create Application Record with selected clinic_id
      const { error: appError } = await supabase.from('applications').insert({
        clinic_id: clinicIdToUse || '00000000-0000-0000-0000-000000000000',
        plan_id: planIdToUse,
        profile_id: authUserId,
        status: 'submitted',
        applicant_name: `${formData.firstName} ${formData.lastName}`,
        applicant_phone: formData.mobile,
        applicant_email: formData.email,
        applicant_id_number: formData.idNumber,
        agreed_popia: formData.agreedPopia,
        agreed_medical_disclosure: formData.agreedMedical,
        agreed_debit_mandate: formData.agreedDebit,
        agreed_terms: formData.agreedTerms,
        source: 'self_service'
      });"""

content = content.replace(handleSubmit_old, handleSubmit_new)

# 5. Fix step offsets in render (change step 2 to 3, etc.)
content = content.replace("{currentStep === 2 && (", "{currentStep === 3 && (")
content = content.replace("{currentStep === 3 && (", "<!--STEP3-->") # Temporary marker

content = content.replace("{/* STEP 2: PERSONAL */}", "{/* STEP 3: PERSONAL */}")
content = content.replace("{/* STEP 3: CLINIC SELECTION", "{/* STEP 4: CLINIC SELECTION")
content = content.replace("{/* STEP 4: CHOOSE PLAN", "{/* STEP 5: CHOOSE PLAN")
content = content.replace("{/* STEP 5: DISCLAIMERS", "{/* STEP 6: DISCLAIMERS")
content = content.replace("{/* STEP 6: BANKING", "{/* STEP 7: BANKING")
content = content.replace("{/* STEP 7: REVIEW", "{/* STEP 8: REVIEW")

for i in range(7, 2, -1):
    content = content.replace(f"{{currentStep === {i} && (", f"{{currentStep === {i+1} && (")

# Restore STEP3 marker
content = content.replace("<!--STEP3-->", "{currentStep === 3 && (")

# Add STEP 2 (Verify Email) after STEP 1 closing
step2_html = """
              {/* STEP 2: VERIFY EMAIL */}
              {currentStep === 2 && (
                <form onSubmit={handleNext}>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Verify Your Email</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
                    We've sent a 6-digit code to <strong>{formData.email}</strong>. Please enter it below to confirm your account.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Verification Code</label>
                    <input type="text" className="form-input" placeholder="123456" required
                      style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                      value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
                  </div>
                  
                  {errorMsg && (
                    <div style={{ color: 'var(--status-error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)' }}>
                    <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ paddingLeft: 0 }} disabled={isSubmitting}><ArrowLeft size={18} /> Back</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || otpCode.length !== 6}>
                      {isSubmitting ? 'Verifying...' : 'Verify Email'} <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              )}
"""

step1_end_str = """                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-8)' }}>
                    <button type="submit" className="btn btn-primary">Continue <ArrowRight size={18} /></button>
                  </div>
                </form>
              )}"""

if step1_end_str in content:
    step1_with_error = step1_end_str.replace(
        "                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-8)' }}>",
        """                  {errorMsg && (
                    <div style={{ color: 'var(--status-error)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                      {errorMsg}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-8)' }}>"""
    )
    content = content.replace(step1_end_str, step1_with_error + step2_html)
else:
    print("Could not find step 1 end string!")

# Banking Step Enhancement
banking_old = """                  <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <select className="form-input" required value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })}>
                        <option value="">Select Bank</option>
                        <option value="fnb">First National Bank (FNB)</option>
                        <option value="standard">Standard Bank</option>
                        <option value="absa">ABSA</option>
                        <option value="nedbank">Nedbank</option>
                        <option value="capitec">Capitec Bank</option>
                        <option value="discovery">Discovery Bank</option>
                        <option value="investec">Investec</option>
                        <option value="tymebank">TymeBank</option>
                        <option value="african">African Bank</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Branch Code</label>
                      <input type="text" className="form-input" required placeholder="e.g. 250655"
                        value={formData.branchCode} onChange={e => setFormData({ ...formData, branchCode: e.target.value })} />
                    </div>
                  </div>"""

banking_new = """                  <div style={{ background: 'var(--bg-surface)', padding: 'var(--sp-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: 'var(--sp-6)' }}>
                    <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                      <div className="form-group">
                        <label className="form-label">Bank Name</label>
                        <select className="form-input" required value={formData.bankName} onChange={e => {
                          const bank = e.target.value;
                          const branchCodes: Record<string, string> = {
                            'FNB': '250655', 'Standard Bank': '051001', 'ABSA': '632005',
                            'Nedbank': '198765', 'Capitec Bank': '470010', 'Discovery Bank': '679000',
                            'Investec': '580105', 'TymeBank': '678910', 'African Bank': '430000'
                          };
                          setFormData({ ...formData, bankName: bank, branchCode: branchCodes[bank] || '' });
                        }}>
                          <option value="">Select Bank</option>
                          <option value="FNB">First National Bank (FNB)</option>
                          <option value="Standard Bank">Standard Bank</option>
                          <option value="ABSA">ABSA</option>
                          <option value="Nedbank">Nedbank</option>
                          <option value="Capitec Bank">Capitec Bank</option>
                          <option value="Discovery Bank">Discovery Bank</option>
                          <option value="Investec">Investec</option>
                          <option value="TymeBank">TymeBank</option>
                          <option value="African Bank">African Bank</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Branch Code</label>
                        <input type="text" className="form-input" required placeholder="Auto-filled"
                          value={formData.branchCode} onChange={e => setFormData({ ...formData, branchCode: e.target.value })} />
                      </div>
                    </div>
                  </div>"""

content = content.replace(banking_old, banking_new)

# Disclaimers Step Enhancement
disclaimers_old = """                  <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} 
                        checked={formData.hasPreExisting} onChange={e => setFormData({ ...formData, hasPreExisting: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>I have pre-existing chronic conditions</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Examples: Hypertension, Diabetes, Asthma.</div>
                      </div>
                    </label>
                  </div>"""

disclaimers_new = """                  <div className="form-group" style={{ marginBottom: 'var(--sp-4)', background: 'var(--bg-surface-sunken)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} 
                        checked={formData.hasPreExisting} onChange={e => setFormData({ ...formData, hasPreExisting: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>I have pre-existing chronic conditions</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Examples: Hypertension, Diabetes, Asthma.</div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 'var(--sp-4)', background: 'var(--bg-surface-sunken)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" required style={{ marginTop: '4px', accentColor: 'var(--navy)' }} 
                        checked={formData.agreedMedical} onChange={e => setFormData({ ...formData, agreedMedical: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>Medical Disclosure Consent</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>I consent to the clinic sharing necessary medical records with the provider for the purpose of primary healthcare services.</div>
                      </div>
                    </label>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--sp-6)', background: 'var(--bg-surface-sunken)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" required style={{ marginTop: '4px', accentColor: 'var(--navy)' }} 
                        checked={formData.agreedPopia} onChange={e => setFormData({ ...formData, agreedPopia: e.target.checked })} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>POPIA Declaration</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>I understand that my personal information will be processed securely in accordance with the Protection of Personal Information Act.</div>
                      </div>
                    </label>
                  </div>"""

content = content.replace(disclaimers_old, disclaimers_new)

# Review Step Enhancement
review_terms_old = """                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} required
                        checked={formData.acceptsTerms} onChange={e => setFormData({ ...formData, acceptsTerms: e.target.checked })} />
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        I have read, understood, and accept the Terms & Conditions, and I authorize the monthly debit order for my {formData.clinicName || 'clinic'} membership.
                      </div>
                    </label>"""

review_terms_new = """                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer', marginBottom: 'var(--sp-4)' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} required
                        checked={formData.agreedTerms} onChange={e => setFormData({ ...formData, agreedTerms: e.target.checked })} />
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        I have read, understood, and accept the General Terms & Conditions for my membership.
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', accentColor: 'var(--navy)' }} required
                        checked={formData.agreedDebit} onChange={e => setFormData({ ...formData, agreedDebit: e.target.checked })} />
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        I authorize the monthly debit order of R{formData.planFee} for my {formData.clinicName || 'clinic'} membership.
                      </div>
                    </label>"""

content = content.replace(review_terms_old, review_terms_new)
content = content.replace("!formData.acceptsTerms", "(!formData.agreedTerms || !formData.agreedDebit)")

with open('src/pages/auth/ApplyPage.tsx', 'w') as f:
    f.write(content)
