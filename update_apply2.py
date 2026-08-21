import re

with open('src/pages/auth/ApplyPage.tsx', 'r') as f:
    content = f.read()

# 1. Update steps array
content = content.replace(
    "const steps = ['Account', 'Verify Email', 'Personal', 'Clinic', 'Plan', 'Disclaimers', 'Banking', 'Review'];",
    "const steps = ['Personal', 'Account', 'Verify Email', 'Clinic', 'Plan', 'Disclaimers', 'Banking', 'Review'];"
)

# 2. Swap the step logic in handleNext
# First, extract the old step 1, 2, 3 logic
handleNext_regex = re.compile(r'(const handleNext = async \(e\?: React\.FormEvent\) => \{.*?)(if \(currentStep < steps\.length\) setCurrentStep\(c => c \+ 1\);\n  \};)', re.DOTALL)
handleNext_match = handleNext_regex.search(content)

if handleNext_match:
    new_handleNext = """const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    
    // Step 1: Personal (Validate ID Number and Phone)
    if (currentStep === 1) {
      if (idType === 'sa_id' && !isValidSAId(formData.idNumber)) {
        alert("Please enter a valid 13-digit South African ID number.");
        return;
      }
      const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
      if (!phoneRegex.test(formData.mobile)) {
        alert("Please enter a valid South African mobile number (e.g., 0821234567).");
        return;
      }
      setCurrentStep(2); // Go to Account
      return;
    }

    // Step 2: Create Account
    if (currentStep === 2) {
      if (formData.authMethod === 'google') {
        await signInWithOAuth('google', window.location.origin + '/apply');
        return;
      }
      setIsSubmitting(true);
      try {
        if (formData.authMethod === 'password') {
          const metadata = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.mobile,
            portal_role: 'member'
          };
          const { error } = await signUpWithPassword(formData.email, formData.password, metadata);
          if (error) throw error;
        } else if (formData.authMethod === 'magiclink') {
          const { error } = await loginWithOtp(formData.email);
          if (error) throw error;
        }
        setCurrentStep(3); // Go to Verify Email
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to create account.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Step 3: Verify OTP
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const type = formData.authMethod === 'password' ? 'signup' : 'magiclink';
        const { error } = await supabase.auth.verifyOtp({ email: formData.email, token: otpCode, type: type as any });
        if (error) throw error;
        setCurrentStep(4); // Go to Clinic
      } catch (err: any) {
        setErrorMsg('Invalid verification code.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    """
    content = content.replace(handleNext_match.group(1), new_handleNext)

# 3. Swap the JSX blocks
# Find the step blocks
# Step 1: Account
# Step 2: Verify Email
# Step 3: Personal
# I'll just change the conditions `{currentStep === X && (` 

content = content.replace("{/* STEP 1: ACCOUNT */}", "{/* STEP 2: ACCOUNT */}")
content = content.replace("{/* STEP 2: VERIFY EMAIL */}", "{/* STEP 3: VERIFY EMAIL */}")
content = content.replace("{/* STEP 3: PERSONAL */}", "{/* STEP 1: PERSONAL */}")

content = content.replace("{currentStep === 1 && (\n                <form onSubmit={handleNext}>\n                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Create Account</h2>", 
                          "{currentStep === 2 && (\n                <form onSubmit={handleNext}>\n                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Create Account</h2>")

content = content.replace("{currentStep === 2 && (\n                <form onSubmit={handleNext}>\n                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Verify Your Email</h2>",
                          "{currentStep === 3 && (\n                <form onSubmit={handleNext}>\n                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Verify Your Email</h2>")

content = content.replace("{currentStep === 3 && (\n                <form onSubmit={handleNext}>\n                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Personal Details</h2>",
                          "{currentStep === 1 && (\n                <form onSubmit={handleNext}>\n                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-1)' }}>Personal Details</h2>")


with open('src/pages/auth/ApplyPage.tsx', 'w') as f:
    f.write(content)
