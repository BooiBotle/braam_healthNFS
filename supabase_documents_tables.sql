-- SQL Script to run in Supabase SQL Editor
-- Creates tables for Documents and Communications

-- 1. Create Communications Table
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL CHECK (type IN ('kyc_request', 'mandate_request', 'general_notice')),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    document_url TEXT, -- Optional link to a document they need to sign/view
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'acknowledged')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for communications
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Member can view their own communications
CREATE POLICY "Members can view their own communications" ON public.communications
    FOR SELECT USING (
        member_id IN (
            SELECT id FROM public.members WHERE profile_id = auth.uid()
        )
    );

-- Admins can view/insert/update all communications
CREATE POLICY "Admins can manage communications" ON public.communications
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE portal_role IN ('admin', 'superadmin', 'staff'))
    );


-- 2. Create Documents Table (for user uploads back to the clinic)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    communication_id UUID REFERENCES public.communications(id) ON DELETE SET NULL,
    doc_type VARCHAR NOT NULL, -- e.g., 'kyc_id', 'signed_mandate'
    file_name VARCHAR NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Members can insert and view their own documents
CREATE POLICY "Members can view their own documents" ON public.documents
    FOR SELECT USING (
        member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
    );

CREATE POLICY "Members can upload documents" ON public.documents
    FOR INSERT WITH CHECK (
        member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
    );

-- Admins can manage all documents
CREATE POLICY "Admins can manage documents" ON public.documents
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE portal_role IN ('admin', 'superadmin', 'staff'))
    );

-- 3. Create Storage Bucket for Documents
-- (Run this if you haven't created a 'documents' bucket in the Storage UI)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;
