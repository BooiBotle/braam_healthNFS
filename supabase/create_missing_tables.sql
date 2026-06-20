-- Migration to create missing tables if they don't exist

CREATE TABLE IF NOT EXISTS public.dependants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    relationship text NOT NULL,
    date_of_birth date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    date timestamp with time zone NOT NULL,
    amount_cents integer NOT NULL,
    status text NOT NULL,
    method text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.dependants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies (assuming basic access for the member)
CREATE POLICY "Users can view own dependants"
    ON public.dependants FOR SELECT
    USING (member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid()));

CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid()));
